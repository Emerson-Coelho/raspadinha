import axios from 'axios';
import sequelize from '../config/database.js';
import PaymentGateway from '../models/PaymentGateway.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { decrypt } from '../utils/encryption.js';
import Logger from '../utils/logger.js';
import { UnifyPayAdapter } from '../utils/gatewayAdapters.js';

/**
 * Função para buscar o gateway mais recente do banco de dados
 * Isso garante que sempre tenhamos as chaves mais atualizadas
 * @param {string} gatewayId - ID do gateway a ser buscado
 * @returns {Promise<Object>} - Gateway atualizado
 */
async function getLatestGateway(gatewayId) {
  // Buscar sempre o gateway mais recente no banco de dados
  // Isso evita problemas com cache e garante que as chaves estão atualizadas
  const gateway = await PaymentGateway.findByPk(gatewayId, {
    raw: false // Importante: não usar raw para permitir que os getters funcionem corretamente
  });
  
  if (!gateway) {
    throw new Error(`Gateway de pagamento ${gatewayId} não encontrado`);
  }
  
  return gateway;
}

// @desc    Criar uma transação de depósito
// @route   POST /api/transactions/deposit
// @access  Private
export const createDeposit = async (req, res) => {
  // Iniciar uma transação de banco de dados para garantir consistência
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { amount, paymentMethod, gatewayId } = req.body;
    
    // Validar dados
    if (!amount || !paymentMethod || !gatewayId) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Forneça o valor, método de pagamento e gateway.'
      });
    }
    
    // Verificar se o valor é válido
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O valor do depósito deve ser maior que zero.'
      });
    }
    
    // Buscar o gateway SEMPRE do banco de dados para ter as chaves mais recentes
    let gateway;
    try {
      gateway = await getLatestGateway(gatewayId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Gateway de pagamento não encontrado.'
      });
    }
    
    if (!gateway.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway de pagamento está inativo.'
      });
    }
    
    // Verificar se o endpoint da API está configurado
    if (!gateway.apiEndpoint) {
      return res.status(400).json({
        success: false,
        message: 'Gateway não configurado corretamente. Endpoint da API não definido.'
      });
    }
    
    // Verificar se o gateway suporta o método de pagamento selecionado
    if (paymentMethod === 'pix' && !gateway.allowPix) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway não suporta pagamentos via PIX.'
      });
    }
    
    if (paymentMethod === 'card' && !gateway.allowCard) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway não suporta pagamentos via cartão.'
      });
    }
    
    // Verificar se o gateway suporta depósitos
    if (!gateway.forDeposit) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway não está configurado para depósitos.'
      });
    }
    
    try {
      // Criar transação no banco de dados
      const transaction = await Transaction.create({
        userId: req.user.id,
        type: 'deposit',
        amount,
        paymentMethod,
        gatewayId,
        status: 'pending',
        details: {
          gatewayName: gateway.name
        }
      }, { transaction: dbTransaction });
      
      // Preparar dados para a API do UnifyPay
      const payloadData = {
        amount,
        currency: 'BRL',
        identifier: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        callbackUrl: `${process.env.API_URL || 'http://localhost:3000'}/api/webhooks/unifypay/callback`,
        metadata: {
          transactionId: transaction.id,
          userId: req.user.id
        },
        client: {
          name: req.user.name,
          email: req.user.email,
          document: req.user.cpf.replace(/[^\d]/g, ''),
          phone: req.user.phone || '99999999999'
        },
        paymentMethod
      };
      
      // Formatar o payload usando o adaptador
      const payload = UnifyPayAdapter.formatDepositPayload(payloadData);
      
      // Usar o adaptador para determinar a rota correta
      const apiRoute = UnifyPayAdapter.getDepositRoute(gateway.apiEndpoint, paymentMethod);
      
      console.log('Enviando requisição para UnifyPay:', {
        url: apiRoute,
        payload: { ...payload, client: { ...payload.client, document: '********' } }
      });
      
      // Obter as chaves mais recentes diretamente do modelo
      // Isso garante que usamos os valores descriptografados mais atuais
      const publicKey = gateway.publicKey;
      const secretKey = gateway.secretKey;
      
      // Verificar se as chaves públicas e privadas estão configuradas
      if (!publicKey || !secretKey) {
        return res.status(400).json({
          success: false,
          message: 'Gateway não configurado corretamente. Chaves de API não definidas.'
        });
      }
      
      console.log(`Usando chaves do gateway ${gateway.id} carregadas diretamente do banco de dados`);
      
      // Chamar a API do UnifyPay com o endpoint configurado
      const unifypayResponse = await axios.post(
        apiRoute,
        payload,
        {
          headers: UnifyPayAdapter.getApiHeaders(publicKey, secretKey)
        }
      );
      
      // Atualizar a transação com os dados do UnifyPay
      await transaction.update({
        gatewayTransactionId: unifypayResponse.data.id,
        details: {
          ...transaction.details,
          gatewayResponse: unifypayResponse.data
        }
      }, { transaction: dbTransaction });
      
      // Confirmar a transação de banco de dados
      await dbTransaction.commit();
      
      // Registrar log de sucesso
      await Logger.info(
        'gateway_deposit',
        `Depósito criado com sucesso via ${gateway.name}`,
        {
          transactionId: transaction.id,
          amount,
          paymentMethod,
          gatewayId,
          gatewayTransactionId: unifypayResponse.data.id
        },
        req.user.id
      );
      
      // Retornar resposta com base no método de pagamento
      if (paymentMethod === 'pix') {
        return res.status(201).json({
          success: true,
          message: 'Depósito criado com sucesso.',
          transactionId: transaction.id,
          qrCodeUrl: unifypayResponse.data.qrCodeUrl,
          pixCode: unifypayResponse.data.pixCode,
          expiresAt: unifypayResponse.data.expiresAt
        });
      } else if (paymentMethod === 'card') {
        return res.status(201).json({
          success: true,
          message: 'Depósito criado com sucesso.',
          transactionId: transaction.id,
          redirectUrl: unifypayResponse.data.checkoutUrl
        });
      }
    } catch (error) {
      // Reverter a transação de banco de dados em caso de erro
      await dbTransaction.rollback();
      
      // Usar o adaptador para determinar a URL da API
      const apiUrl = UnifyPayAdapter.getDepositRoute(
        gateway.apiEndpoint, 
        paymentMethod
      );
      
      // Registrar log detalhado do erro
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        request: {
          method: 'POST',
          url: apiUrl,
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': '********', // Ocultar a chave por segurança
            'x-secret-key': '********'  // Ocultar a chave por segurança
          },
          data: {
            amount,
            currency: 'BRL',
            callbackUrl: `${process.env.API_URL}/api/webhooks/unifypay/callback`,
            metadata: {
              userId: req.user.id
            },
            client: {
              name: req.user.name,
              email: req.user.email,
              document: req.user.cpf.replace(/[^\d]/g, ''),
              phone: req.user.phone || '99999999999'
            }
          }
        }
      };
      
      // Adicionar detalhes da resposta se disponível
      if (error.response) {
        errorDetails.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        };
      }
      
      await Logger.error(
        'gateway_deposit',
        `Erro ao processar depósito via ${gateway.name}: ${error.message}`,
        errorDetails,
        req.user.id
      );
      
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar depósito:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar depósito.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Criar uma transação de saque
// @route   POST /api/transactions/withdraw
// @access  Private
export const createWithdraw = async (req, res) => {
  // Iniciar uma transação de banco de dados para garantir consistência
  const dbTransaction = await sequelize.transaction();
  
  try {
    const { 
      amount, 
      paymentMethod, 
      gatewayId, 
      pixKey, 
      pixKeyType, 
      cardNumber, 
      cardName, 
      cardBank 
    } = req.body;
    
    // Validar dados
    if (!amount || !paymentMethod || !gatewayId) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos. Forneça o valor, método de pagamento e gateway.'
      });
    }
    
    // Verificar se o valor é válido
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O valor do saque deve ser maior que zero.'
      });
    }
    
    // Buscar o gateway SEMPRE do banco de dados para ter as chaves mais recentes
    let gateway;
    try {
      gateway = await getLatestGateway(gatewayId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Gateway de pagamento não encontrado.'
      });
    }
    
    if (!gateway.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway de pagamento está inativo.'
      });
    }
    
    // Verificar se o método de pagamento é suportado
    if (paymentMethod === 'pix' && 
        ((gateway.paymentMethods && !gateway.paymentMethods.allowPix) || 
         (gateway.allowPix !== undefined && !gateway.allowPix))) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway não suporta saques via PIX.'
      });
    }
    
    if (paymentMethod === 'card' && 
        ((gateway.paymentMethods && !gateway.paymentMethods.allowCard) || 
         (gateway.allowCard !== undefined && !gateway.allowCard))) {
      return res.status(400).json({
        success: false,
        message: 'Este gateway não suporta saques via cartão.'
      });
    }
    
    // Obter as chaves mais recentes diretamente do modelo
    const publicKey = gateway.publicKey;
    const secretKey = gateway.secretKey;
    
    // Verificar se a chave secreta está configurada
    if (!publicKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Gateway não configurado corretamente. Chaves de API não definidas.'
      });
    }
    
    // Buscar o usuário para verificar o saldo
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    // Verificar se o usuário tem saldo suficiente
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente para realizar o saque.'
      });
    }
    
    try {
      // Criar transação no banco de dados
      const transaction = await Transaction.create({
        userId: req.user.id,
        type: 'withdraw',
        amount,
        paymentMethod,
        gatewayId,
        status: 'pending',
        details: {
          gatewayName: gateway.name,
          pixKey: pixKey,
          pixKeyType: pixKeyType,
          cardNumber: cardNumber ? cardNumber.slice(-4) : null,
          cardName,
          cardBank
        }
      }, { transaction: dbTransaction });
      
      // Obter o endpoint da API configurado no gateway
      const apiEndpoint = gateway.apiEndpoint;
      
      // Verificar se o endpoint da API está configurado
      if (!apiEndpoint) {
        return res.status(400).json({
          success: false,
          message: 'Gateway não configurado corretamente. Endpoint da API não definido.'
        });
      }
      
      console.log(`Usando chaves do gateway ${gateway.id} carregadas diretamente do banco de dados`);
      
      // Preparar dados para a API do UnifyPay
      const payload = {
        amount,
        currency: 'BRL',
        callbackUrl: `${process.env.API_URL}/api/webhooks/unifypay/callback`,
        metadata: {
          transactionId: transaction.id,
          userId: req.user.id
        },
        recipient: {
          name: req.user.name,
          document: req.user.cpf
        }
      };
      
      // Adicionar dados específicos do método de pagamento
      if (paymentMethod === 'pix') {
        payload.pixKey = pixKey;
        payload.pixKeyType = pixKeyType;
      } else if (paymentMethod === 'card') {
        payload.card = {
          number: cardNumber,
          name: cardName,
          bank: cardBank
        };
      }
      
      // Usar o adaptador para determinar a rota correta
      const apiRoute = UnifyPayAdapter.getWithdrawRoute(apiEndpoint, paymentMethod);
      
      // Chamar a API do UnifyPay
      const unifypayResponse = await axios.post(
        apiRoute,
        payload,
        {
          headers: UnifyPayAdapter.getApiHeaders(publicKey, secretKey)
        }
      );
      
      // Atualizar a transação com os dados do UnifyPay
      await transaction.update({
        gatewayTransactionId: unifypayResponse.data.id,
        details: {
          ...transaction.details,
          gatewayResponse: unifypayResponse.data
        }
      }, { transaction: dbTransaction });
      
      // Atualizar o saldo do usuário
      await user.update({
        balance: sequelize.literal(`balance - ${amount}`)
      }, { transaction: dbTransaction });
      
      // Confirmar a transação de banco de dados
      await dbTransaction.commit();
      
      // Registrar log de sucesso
      await Logger.info(
        'gateway_withdraw',
        `Saque criado com sucesso via ${gateway.name}`,
        {
          transactionId: transaction.id,
          amount,
          paymentMethod,
          gatewayId,
          gatewayTransactionId: unifypayResponse.data.id
        },
        req.user.id
      );
      
      return res.status(201).json({
        success: true,
        message: 'Solicitação de saque criada com sucesso.',
        transactionId: transaction.id,
        newBalance: user.balance - amount
      });
    } catch (error) {
      // Reverter a transação de banco de dados em caso de erro
      await dbTransaction.rollback();
      
      // Usar o adaptador para determinar a URL da API
      const apiUrl = UnifyPayAdapter.getWithdrawRoute(
        gateway.apiEndpoint, 
        paymentMethod
      );
      
      // Registrar log detalhado do erro
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        request: {
          method: 'POST',
          url: apiUrl,
          headers: {
            'Content-Type': 'application/json',
            'x-public-key': '********', // Ocultar a chave por segurança
            'x-secret-key': '********'  // Ocultar a chave por segurança
          },
          data: {
            amount,
            currency: 'BRL',
            callbackUrl: `${process.env.API_URL}/api/webhooks/unifypay/callback`,
            metadata: {
              userId: req.user.id
            }
          }
        }
      };
      
      // Adicionar detalhes da resposta se disponível
      if (error.response) {
        errorDetails.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        };
      }
      
      await Logger.error(
        'gateway_withdraw',
        `Erro ao processar saque via ${gateway.name}: ${error.message}`,
        errorDetails,
        req.user.id
      );
      
      throw error;
    }
  } catch (error) {
    console.error('Erro ao criar saque:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar saque.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Verificar o status de uma transação
// @route   GET /api/transactions/:id/status
// @access  Private
export const getTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar a transação
    const transaction = await Transaction.findOne({
      where: {
        id,
        userId: req.user.id
      }
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada.'
      });
    }
    
    // Se a transação já estiver concluída ou falhou, retornar o status atual
    if (transaction.status !== 'pending') {
      return res.status(200).json({
        success: true,
        status: transaction.status,
        transaction
      });
    }
    
    // Buscar o gateway SEMPRE do banco de dados para ter as chaves mais recentes
    let gateway;
    try {
      gateway = await getLatestGateway(transaction.gatewayId);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Gateway de pagamento não encontrado.'
      });
    }
    
    // Se não houver ID de transação do gateway, retornar o status atual
    if (!transaction.gatewayTransactionId) {
      return res.status(200).json({
        success: true,
        status: transaction.status,
        transaction
      });
    }
    
    try {
      // Obter o endpoint da API configurado no gateway
      const apiEndpoint = gateway.apiEndpoint;
      
      // Verificar se o endpoint da API está configurado
      if (!apiEndpoint) {
        return res.status(400).json({
          success: false,
          message: 'Gateway não configurado corretamente. Endpoint da API não definido.'
        });
      }
      
      // Obter as chaves mais recentes diretamente do modelo
      const publicKey = gateway.publicKey;
      const secretKey = gateway.secretKey;
      
      // Verificar se as chaves públicas e privadas estão configuradas
      if (!publicKey || !secretKey) {
        return res.status(400).json({
          success: false,
          message: 'Gateway não configurado corretamente. Chaves de API não definidas.'
        });
      }
      
      console.log(`Usando chaves do gateway ${gateway.id} carregadas diretamente do banco de dados`);
      
      // Usar o adaptador para determinar a rota correta
      const apiRoute = UnifyPayAdapter.getStatusRoute(apiEndpoint, transaction);
      
      // Verificar o status da transação na API do UnifyPay
      const unifypayResponse = await axios.get(
        apiRoute,
        {
          headers: UnifyPayAdapter.getApiHeaders(publicKey, secretKey)
        }
      );
      
      // Mapear o status do UnifyPay para o status interno
      let newStatus = UnifyPayAdapter.mapStatus(unifypayResponse.data.status) || transaction.status;
      
      // Atualizar o status da transação se necessário
      if (newStatus !== transaction.status) {
        await transaction.update({
          status: newStatus,
          details: {
            ...transaction.details,
            gatewayResponse: unifypayResponse.data
          }
        });
        
        // Se a transação foi concluída e é um depósito, atualizar o saldo do usuário
        if (newStatus === 'completed' && transaction.type === 'deposit') {
          await User.update(
            {
              balance: sequelize.literal(`balance + ${transaction.amount}`)
            },
            {
              where: { id: transaction.userId }
            }
          );
          
          // Registrar log de depósito concluído
          await Logger.info(
            'transaction_status',
            `Depósito concluído com sucesso: ${transaction.amount} BRL`,
            {
              transactionId: transaction.id,
              gatewayTransactionId: transaction.gatewayTransactionId,
              previousStatus: transaction.status,
              newStatus,
              amount: transaction.amount
            },
            transaction.userId
          );
        } else if (newStatus === 'failed') {
          // Registrar log de falha na transação
          await Logger.warning(
            'transaction_status',
            `Transação falhou: ${transaction.type} de ${transaction.amount} BRL`,
            {
              transactionId: transaction.id,
              gatewayTransactionId: transaction.gatewayTransactionId,
              previousStatus: transaction.status,
              newStatus,
              amount: transaction.amount,
              gatewayResponse: unifypayResponse.data
            },
            transaction.userId
          );
        }
      }
      
      return res.status(200).json({
        success: true,
        status: newStatus,
        transaction: {
          ...transaction.toJSON(),
          status: newStatus
        }
      });
    } catch (error) {
      console.error('Erro ao verificar status na API do gateway:', error);
      
      // Registrar log de erro ao verificar status
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        transactionId: transaction.id,
        gatewayTransactionId: transaction.gatewayTransactionId
      };
      
      // Adicionar detalhes da resposta se disponível
      if (error.response) {
        errorDetails.response = {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        };
      }
      
      await Logger.error(
        'transaction_status',
        `Erro ao verificar status da transação no gateway: ${error.message}`,
        errorDetails,
        transaction.userId
      );
      
      // Em caso de erro na API do gateway, retornar o status atual
      return res.status(200).json({
        success: true,
        status: transaction.status,
        transaction,
        gatewayError: process.env.NODE_ENV === 'development' ? error.message : 'Erro ao comunicar com o gateway'
      });
    }
  } catch (error) {
    console.error('Erro ao verificar status da transação:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar status da transação.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obter transações do usuário
// @route   GET /api/transactions/user
// @access  Private
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: {
        userId: req.user.id
      },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Erro ao buscar transações do usuário:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao buscar transações do usuário.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 