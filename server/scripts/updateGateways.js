import PaymentGateway from '../models/PaymentGateway.js';
import sequelize from '../config/database.js';

/**
 * Atualiza os endpoints e chaves dos gateways existentes com base nos parâmetros fornecidos
 * @param {Object} options - Opções para atualização
 * @param {string} options.unifypayEndpoint - Endpoint para o gateway UnifyPay
 * @param {string} options.bspayEndpoint - Endpoint para o gateway BSPay
 * @param {string} options.unifypayPublicKey - Chave pública para o gateway UnifyPay
 * @param {string} options.unifypaySecretKey - Chave secreta para o gateway UnifyPay
 * @param {string} options.bspayPublicKey - Chave pública para o gateway BSPay
 * @param {string} options.bspaySecretKey - Chave secreta para o gateway BSPay
 */
export async function updateGatewayEndpoints(options = {}) {
  try {
    console.log('Atualizando configurações de gateways de pagamento...');
    
    // Obter os parâmetros
    const { 
      unifypayEndpoint, 
      bspayEndpoint,
      unifypayPublicKey,
      unifypaySecretKey,
      bspayPublicKey,
      bspaySecretKey
    } = options;
    
    // Verificar se pelo menos um parâmetro foi fornecido
    if (!unifypayEndpoint && !bspayEndpoint && 
        !unifypayPublicKey && !unifypaySecretKey && 
        !bspayPublicKey && !bspaySecretKey) {
      console.log('Nenhum parâmetro fornecido para atualização.');
      console.log('Use: node server/scripts/updateGateways.js --unifypay=https://api.exemplo.com --bspay=https://api.outroexemplo.com');
      console.log('Para atualizar chaves: --unifypay-public-key=CHAVE --unifypay-secret-key=CHAVE');
      return;
    }
    
    // Verificar se existem gateways no banco de dados
    const existingGateways = await PaymentGateway.findAll();
    
    // Se não houver gateways no banco de dados, não prosseguir com a atualização
    if (existingGateways.length === 0) {
      console.log('Nenhum gateway encontrado no banco de dados. Primeiro, inicialize os gateways.');
      return;
    }
    
    // Iniciar uma transação
    const transaction = await sequelize.transaction();
    
    try {
      // Atualizar UnifyPay se houver algum parâmetro fornecido
      if (unifypayEndpoint || unifypayPublicKey || unifypaySecretKey) {
        const unifyPayGateway = await PaymentGateway.findByPk('unifypay');
        
        if (!unifyPayGateway) {
          console.log('Gateway UnifyPay não encontrado no banco de dados.');
        } else {
          // Construir objeto de atualização
          const updateData = {};
          
          if (unifypayEndpoint) {
            updateData.apiEndpoint = unifypayEndpoint;
          }
          
          if (unifypayPublicKey) {
            updateData.publicKey = unifypayPublicKey;
          }
          
          if (unifypaySecretKey) {
            updateData.secretKey = unifypaySecretKey;
          }
          
          const unifyPayUpdated = await PaymentGateway.update(
            updateData,
            {
              where: { id: 'unifypay' },
              transaction
            }
          );
          
          console.log(`UnifyPay atualizado: ${unifyPayUpdated[0]} registro(s)`);
          if (unifypayEndpoint) console.log(`- Endpoint: ${unifypayEndpoint}`);
          if (unifypayPublicKey) console.log(`- Chave pública atualizada`);
          if (unifypaySecretKey) console.log(`- Chave secreta atualizada`);
        }
      }
      
      // Atualizar BSPay se houver algum parâmetro fornecido
      if (bspayEndpoint || bspayPublicKey || bspaySecretKey) {
        const bspayGateway = await PaymentGateway.findByPk('bspay');
        
        if (!bspayGateway) {
          console.log('Gateway BSPay não encontrado no banco de dados.');
        } else {
          // Construir objeto de atualização
          const updateData = {};
          
          if (bspayEndpoint) {
            updateData.apiEndpoint = bspayEndpoint;
          }
          
          if (bspayPublicKey) {
            updateData.publicKey = bspayPublicKey;
          }
          
          if (bspaySecretKey) {
            updateData.secretKey = bspaySecretKey;
          }
          
          const bspayUpdated = await PaymentGateway.update(
            updateData,
            {
              where: { id: 'bspay' },
              transaction
            }
          );
          
          console.log(`BSPay atualizado: ${bspayUpdated[0]} registro(s)`);
          if (bspayEndpoint) console.log(`- Endpoint: ${bspayEndpoint}`);
          if (bspayPublicKey) console.log(`- Chave pública atualizada`);
          if (bspaySecretKey) console.log(`- Chave secreta atualizada`);
        }
      }
      
      // Commit da transação
      await transaction.commit();
      console.log('Atualização de configurações de gateways concluída com sucesso!');
    } catch (error) {
      // Rollback em caso de erro
      await transaction.rollback();
      console.error('Erro durante a atualização de configurações de gateways:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('Erro ao atualizar configurações de gateways:', error);
  }
}

// Executar a função se o script for chamado diretamente
if (process.argv[1].includes('updateGateways.js')) {
  (async () => {
    try {
      // Processar argumentos de linha de comando
      const args = process.argv.slice(2);
      const options = {};
      
      args.forEach(arg => {
        if (arg.startsWith('--unifypay=')) {
          options.unifypayEndpoint = arg.replace('--unifypay=', '');
        } else if (arg.startsWith('--bspay=')) {
          options.bspayEndpoint = arg.replace('--bspay=', '');
        } else if (arg.startsWith('--unifypay-public-key=')) {
          options.unifypayPublicKey = arg.replace('--unifypay-public-key=', '');
        } else if (arg.startsWith('--unifypay-secret-key=')) {
          options.unifypaySecretKey = arg.replace('--unifypay-secret-key=', '');
        } else if (arg.startsWith('--bspay-public-key=')) {
          options.bspayPublicKey = arg.replace('--bspay-public-key=', '');
        } else if (arg.startsWith('--bspay-secret-key=')) {
          options.bspaySecretKey = arg.replace('--bspay-secret-key=', '');
        }
      });
      
      // Verificar se existem gateways no banco de dados
      const existingGateways = await PaymentGateway.findAll();
      
      // Definir valores padrão apenas se não houver argumentos e não existirem gateways
      if (args.length === 0) {
        if (existingGateways.length > 0) {
          console.log('ATENÇÃO: Gateways já existem no banco de dados e nenhum parâmetro foi fornecido.');
          console.log('Para evitar sobrescrever configurações existentes, a atualização foi cancelada.');
          console.log('Use: node server/scripts/updateGateways.js --unifypay=https://api.exemplo.com --bspay=https://api.outroexemplo.com');
          console.log('Para atualizar chaves: --unifypay-public-key=CHAVE --unifypay-secret-key=CHAVE');
          process.exit(0);
        } else {
          console.log('Nenhum argumento fornecido e nenhum gateway encontrado. Usando valores padrão.');
          options.unifypayEndpoint = 'https://app.unifypay.co';
          options.bspayEndpoint = 'https://app.bspay.co';
        }
      }
      
      await updateGatewayEndpoints(options);
      process.exit(0);
    } catch (error) {
      console.error('Erro ao executar script:', error);
      process.exit(1);
    }
  })();
} 