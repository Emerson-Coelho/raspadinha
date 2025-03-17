import axios from 'axios';
import sequelize from '../config/database.js';
import PaymentGateway from '../models/PaymentGateway.js';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import { decrypt } from '../utils/encryption.js';
import Logger from '../utils/logger.js';

// URL base padrão da API do UnifyPay (será substituída pelo valor do gateway)
const DEFAULT_UNIFYPAY_API_URL = 'https://api.unifypay.co';

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
    
    // Buscar o gateway de pagamento
    const gateway = await PaymentGateway.findByPk(gatewayId);
    
    if (!gateway) {
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
      
      // Obter o endpoint da API configurado no gateway ou usar o padrão
      const apiEndpoint = gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL;
      
      // Preparar dados para a API do UnifyPay
      const payload = {
        amount,
        currency: 'BRL',
        callbackUrl: `${process.env.API_URL}/api/webhooks/unifypay/callback`,
        metadata: {
          transactionId: transaction.id,
          userId: req.user.id
        },
        customer: {
          name: req.user.name,
          email: req.user.email,
          document: req.user.cpf
        }
      };
      
      // Determinar a rota correta com base no método de pagamento
      let apiRoute;
      if (paymentMethod === 'pix') {
        apiRoute = `${apiEndpoint}/gateway/pix/receive`;
      } else if (paymentMethod === 'card') {
        apiRoute = `${apiEndpoint}/gateway/card/receive`;
      } else {
        throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
      }
      
      // Chamar a API do UnifyPay com o endpoint configurado
      const unifypayResponse = await axios.post(
        apiRoute,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gateway.secretKey}`
          }
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
      
      // Determinar a URL da API com base no método de pagamento
      let apiUrl;
      if (paymentMethod === 'pix') {
        apiUrl = `${gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL}/gateway/pix/receive`;
      } else if (paymentMethod === 'card') {
        apiUrl = `${gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL}/gateway/card/receive`;
      } else {
        apiUrl = `${gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL}/transactions`;
      }
      
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
            'Authorization': 'Bearer ********' // Ocultar a chave por segurança
          },
          data: {
            amount,
            currency: 'BRL',
            callbackUrl: `${process.env.API_URL}/api/webhooks/unifypay/callback`,
            metadata: {
              userId: req.user.id
            },
            customer: {
              name: req.user.name,
              email: req.user.email,
              document: req.user.cpf
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
    
    // Buscar o gateway de pagamento
    const gateway = await PaymentGateway.findByPk(gatewayId);
    
    if (!gateway) {
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
    
    // Verificar se a chave secreta está configurada
    if (!gateway.secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Gateway não configurado corretamente. Chave secreta não definida.'
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
      
      // Obter o endpoint da API configurado no gateway ou usar o padrão
      const apiEndpoint = gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL;
      
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
      
      // Determinar a rota correta com base no método de pagamento
      let apiRoute;
      if (paymentMethod === 'pix') {
        apiRoute = `${apiEndpoint}/gateway/pix/send`;
      } else if (paymentMethod === 'card') {
        apiRoute = `${apiEndpoint}/gateway/card/send`;
      } else {
        throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
      }
      
      // Chamar a API do UnifyPay
      const unifypayResponse = await axios.post(
        apiRoute,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gateway.secretKey}`
          }
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
      
      // Determinar a URL da API com base no método de pagamento
      let apiUrl;
      if (paymentMethod === 'pix') {
        apiUrl = `${gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL}/gateway/pix/send`;
      } else if (paymentMethod === 'card') {
        apiUrl = `${gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL}/gateway/card/send`;
      } else {
        apiUrl = `${gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL}/payouts`;
      }
      
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
            'Authorization': 'Bearer ********' // Ocultar a chave por segurança
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
    
    // Buscar o gateway de pagamento
    const gateway = await PaymentGateway.findByPk(transaction.gatewayId);
    
    if (!gateway) {
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
      // Obter o endpoint da API configurado no gateway ou usar o padrão
      const apiEndpoint = gateway.apiEndpoint || DEFAULT_UNIFYPAY_API_URL;
      
      // Determinar a rota correta com base no tipo e método de pagamento da transação
      let apiRoute;
      if (transaction.type === 'deposit') {
        if (transaction.paymentMethod === 'pix') {
          apiRoute = `${apiEndpoint}/gateway/pix/status/${transaction.gatewayTransactionId}`;
        } else if (transaction.paymentMethod === 'card') {
          apiRoute = `${apiEndpoint}/gateway/card/status/${transaction.gatewayTransactionId}`;
        } else {
          apiRoute = `${apiEndpoint}/transactions/${transaction.gatewayTransactionId}`;
        }
      } else if (transaction.type === 'withdraw') {
        if (transaction.paymentMethod === 'pix') {
          apiRoute = `${apiEndpoint}/gateway/pix/status/${transaction.gatewayTransactionId}`;
        } else if (transaction.paymentMethod === 'card') {
          apiRoute = `${apiEndpoint}/gateway/card/status/${transaction.gatewayTransactionId}`;
        } else {
          apiRoute = `${apiEndpoint}/payouts/${transaction.gatewayTransactionId}`;
        }
      } else {
        apiRoute = `${apiEndpoint}/transactions/${transaction.gatewayTransactionId}`;
      }
      
      // Verificar o status da transação na API do UnifyPay
      const unifypayResponse = await axios.get(
        apiRoute,
        {
          headers: {
            'Authorization': `Bearer ${gateway.secretKey}`
          }
        }
      );
      
      // Mapear o status do UnifyPay para o status interno
      let newStatus = transaction.status;
      
      if (unifypayResponse.data.status === 'completed') {
        newStatus = 'completed';
      } else if (unifypayResponse.data.status === 'failed') {
        newStatus = 'failed';
      } else if (unifypayResponse.data.status === 'cancelled') {
        newStatus = 'cancelled';
      }
      
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