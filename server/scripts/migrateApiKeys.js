import sequelize from '../config/database.js';
import PaymentGateway from '../models/PaymentGateway.js';
import { decrypt } from '../utils/encryption.js';

/**
 * Script para migrar as chaves de API do formato criptografado para texto simples
 */
async function migrateApiKeys() {
  try {
    console.log('Iniciando migração das chaves de API...');
    
    // Executar consulta SQL direta para obter as chaves criptografadas
    const [gateways] = await sequelize.query(`
      SELECT id, "publicKey", "secretKey" 
      FROM payment_gateways 
      WHERE "publicKey" IS NOT NULL OR "secretKey" IS NOT NULL
    `);
    
    console.log(`Encontrados ${gateways.length} gateways para migrar`);
    
    // Para cada gateway, descriptografar as chaves e salvá-las em texto simples
    for (const gateway of gateways) {
      console.log(`Migrando chaves para o gateway: ${gateway.id}`);
      
      let publicKeyDecrypted = null;
      let secretKeyDecrypted = null;
      
      // Tentar descriptografar as chaves
      try {
        if (gateway.publicKey) {
          publicKeyDecrypted = decrypt(gateway.publicKey);
          console.log(`Chave pública descriptografada com sucesso`);
        }
        
        if (gateway.secretKey) {
          secretKeyDecrypted = decrypt(gateway.secretKey);
          console.log(`Chave secreta descriptografada com sucesso`);
        }
      } catch (error) {
        console.error(`Erro ao descriptografar chaves para o gateway ${gateway.id}:`, error);
        continue; // Pular para o próximo gateway em caso de erro
      }
      
      // Atualizar o registro com as chaves descriptografadas em formato de texto simples
      await sequelize.query(`
        UPDATE payment_gateways 
        SET 
          "publicKey" = :publicKey, 
          "secretKey" = :secretKey,
          "updatedAt" = NOW()
        WHERE id = :id
      `, {
        replacements: {
          id: gateway.id,
          publicKey: publicKeyDecrypted,
          secretKey: secretKeyDecrypted
        }
      });
      
      console.log(`Gateway ${gateway.id} migrado com sucesso`);
    }
    
    console.log('Migração das chaves de API concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante a migração das chaves de API:', error);
  } finally {
    // Fechar a conexão com o banco de dados
    await sequelize.close();
  }
}

// Executar a função principal
migrateApiKeys(); 