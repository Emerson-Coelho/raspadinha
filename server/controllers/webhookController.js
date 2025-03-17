import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import PaymentGateway from '../models/PaymentGateway.js';
import sequelize from '../config/database.js';
import { decrypt } from '../utils/encryption.js';
import crypto from 'crypto';

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

// @desc    Processar callback do UnifyPay
// @route   POST /api/webhooks/unifypay/callback
// @access  Public
export const unifypayCallback = async (req, res) => {
  try {
    // Verificar assinatura do webhook
    const signature = req.headers['x-unifypay-signature'];
    const payload = JSON.stringify(req.body);
    
    // Obter a transação com base no ID fornecido pelo UnifyPay
    const { event, data } = req.body;
    
    if (!data || !data.id) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos no webhook.'
      });
    }
    
    // Buscar a transação no banco de dados
    const transaction = await Transaction.findOne({
      where: {
        gatewayTransactionId: data.id
      }
    });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada.'
      });
    }
    
    // Buscar o gateway SEMPRE do banco de dados para ter as chaves mais recentes
    let gateway;
    try {
      gateway = await getLatestGateway(transaction.gatewayId);
      console.log(`Gateway ${gateway.id} carregado diretamente do banco de dados para webhook`);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Gateway de pagamento não encontrado.'
      });
    }
    
    // Verificar se existe chave secreta para assinar o webhook
    const secretKey = gateway.secretKey;
    if (!secretKey) {
      return res.status(401).json({
        success: false,
        message: 'Gateway não possui chave de assinatura configurada.'
      });
    }
    
    // Verificar a assinatura do webhook
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payload)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      console.error('Assinatura de webhook inválida');
      return res.status(401).json({
        success: false,
        message: 'Assinatura de webhook inválida.'
      });
    }
    
    // Iniciar uma transação de banco de dados para garantir consistência
    const dbTransaction = await sequelize.transaction();
    
    try {
      // Processar o evento com base no tipo
      switch (event) {
        case 'transaction.updated':
        case 'payout.updated':
          // Atualizar o status da transação
          await transaction.update({
            status: data.status,
            details: {
              ...transaction.details,
              statusUpdatedAt: new Date(),
              webhookData: data
            }
          }, { transaction: dbTransaction });
          
          // Se a transação foi concluída e é um depósito, adicionar o valor ao saldo do usuário
          if (data.status === 'completed' && transaction.type === 'deposit') {
            const user = await User.findByPk(transaction.userId, { transaction: dbTransaction });
            
            if (user) {
              // Registrar o saldo anterior para auditoria
              const previousBalance = user.balance;
              
              // Atualizar o saldo
              await user.update({
                balance: user.balance + parseFloat(transaction.amount)
              }, { transaction: dbTransaction });
              
              // Registrar a atualização do saldo nos detalhes da transação
              await transaction.update({
                details: {
                  ...transaction.details,
                  balanceUpdate: {
                    previousBalance,
                    newBalance: user.balance,
                    updatedAt: new Date()
                  }
                }
              }, { transaction: dbTransaction });
              
              console.log(`Saldo do usuário ${user.id} atualizado via webhook: ${previousBalance} -> ${user.balance}`);
            }
          }
          
          break;
          
        default:
          console.log(`Evento não processado: ${event}`);
      }
      
      // Confirmar a transação de banco de dados
      await dbTransaction.commit();
      
      // Responder com sucesso
      return res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso.'
      });
    } catch (error) {
      // Reverter a transação de banco de dados em caso de erro
      await dbTransaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Erro ao processar webhook.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}; 