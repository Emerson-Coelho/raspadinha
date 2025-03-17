import sequelize from '../config/database.js';
import SystemLog from '../models/SystemLog.js';
import dotenv from 'dotenv';
import colors from 'colors';

// Carregar variáveis de ambiente
dotenv.config();

async function createSystemLogsTable() {
  try {
    console.log(colors.yellow('Verificando conexão com o banco de dados...'));
    await sequelize.authenticate();
    console.log(colors.green('Conexão com o banco de dados estabelecida com sucesso.'));
    
    console.log(colors.yellow('Criando tabela de logs do sistema...'));
    await SystemLog.sync({ force: true });
    
    console.log(colors.green('Tabela de logs do sistema criada com sucesso!'));
    
    // Criar alguns logs de exemplo
    console.log(colors.yellow('Criando logs de exemplo...'));
    
    await SystemLog.bulkCreate([
      {
        type: 'info',
        source: 'system',
        message: 'Sistema inicializado com sucesso',
        details: { version: '1.0.0' }
      },
      {
        type: 'info',
        source: 'system',
        message: 'Rotas da API UnifyPay atualizadas',
        details: { 
          changes: [
            { old: '/transactions', new: '/gateway/pix/receive', method: 'PIX deposit' },
            { old: '/transactions', new: '/gateway/card/receive', method: 'Card deposit' },
            { old: '/payouts', new: '/gateway/pix/send', method: 'PIX withdraw' },
            { old: '/payouts', new: '/gateway/card/send', method: 'Card withdraw' },
            { old: '/transactions/{id}', new: '/gateway/pix/status/{id}', method: 'PIX status' },
            { old: '/transactions/{id}', new: '/gateway/card/status/{id}', method: 'Card status' }
          ],
          date: new Date().toISOString()
        }
      },
      {
        type: 'warning',
        source: 'gateway_deposit',
        message: 'Tentativa de depósito com valor muito baixo',
        details: { 
          amount: 1.0,
          minAmount: 10.0,
          gatewayId: 'unifypay'
        }
      },
      {
        type: 'error',
        source: 'gateway_deposit',
        message: 'Erro ao processar depósito via UnifyPay: Request failed with status code 404',
        details: {
          message: 'Request failed with status code 404',
          request: {
            method: 'POST',
            url: 'https://app.unifypay.co/gateway/pix/receive'
          },
          response: {
            status: 404,
            statusText: 'Not Found',
            data: {
              error: 'API endpoint not found'
            }
          }
        }
      },
      {
        type: 'error',
        source: 'gateway_deposit',
        message: 'Erro ao processar depósito via UnifyPay: getaddrinfo ENOTFOUND app.unifypay.co',
        details: {
          message: 'getaddrinfo ENOTFOUND app.unifypay.co',
          code: 'ENOTFOUND',
          stack: 'Error: getaddrinfo ENOTFOUND app.unifypay.co\n    at GetAddrInfoReqWrap.onlookup [as oncomplete] (node:dns:107:26)',
          request: {
            method: 'POST',
            url: 'https://app.unifypay.co/gateway/pix/receive',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ********'
            },
            data: {
              amount: 50,
              currency: 'BRL',
              callbackUrl: 'https://api.example.com/webhooks/unifypay/callback'
            }
          }
        }
      },
      {
        type: 'error',
        source: 'gateway_withdraw',
        message: 'Erro ao processar saque via UnifyPay: Insufficient funds',
        details: {
          message: 'Insufficient funds',
          request: {
            method: 'POST',
            url: 'https://app.unifypay.co/gateway/pix/send'
          },
          response: {
            status: 400,
            statusText: 'Bad Request',
            data: {
              error: 'insufficient_funds',
              error_description: 'The account does not have sufficient funds to complete this transaction'
            }
          }
        }
      },
      {
        type: 'error',
        source: 'gateway_deposit',
        message: 'Erro ao processar depósito via cartão: Invalid card information',
        details: {
          message: 'Invalid card information',
          request: {
            method: 'POST',
            url: 'https://app.unifypay.co/gateway/card/receive'
          },
          response: {
            status: 400,
            statusText: 'Bad Request',
            data: {
              error: 'invalid_card',
              error_description: 'The card information provided is invalid or expired'
            }
          }
        }
      }
    ]);
    
    console.log(colors.green('Logs de exemplo criados com sucesso!'));
    process.exit(0);
  } catch (error) {
    console.error(colors.red('Erro ao criar tabela de logs:'), error);
    process.exit(1);
  }
}

createSystemLogsTable(); 