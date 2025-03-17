import sequelize from '../config/database.js';
import { DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import colors from 'colors';

// Carregar variáveis de ambiente
dotenv.config();

// Função para adicionar a coluna apiEndpoint à tabela payment_gateways
async function addApiEndpointColumn() {
  try {
    console.log(colors.yellow('Verificando se a coluna apiEndpoint existe na tabela payment_gateways...'));
    
    // Verificar se a tabela payment_gateways existe
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_gateways'");
    
    if (tables.length === 0) {
      console.log(colors.red('A tabela payment_gateways não existe. Execute o script de inicialização de gateways primeiro.'));
      process.exit(1);
    }
    
    // Verificar se a coluna apiEndpoint já existe
    const [columns] = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'payment_gateways' AND column_name = 'apiEndpoint'");
    
    if (columns.length > 0) {
      console.log(colors.green('A coluna apiEndpoint já existe na tabela payment_gateways.'));
      process.exit(0);
    }
    
    // Adicionar a coluna apiEndpoint
    console.log(colors.yellow('Adicionando a coluna apiEndpoint à tabela payment_gateways...'));
    await sequelize.query("ALTER TABLE payment_gateways ADD COLUMN \"apiEndpoint\" VARCHAR(255) DEFAULT 'https://app.unifypay.co'");
    
    console.log(colors.green('Coluna apiEndpoint adicionada com sucesso!'));
    
    // Atualizar os registros existentes
    console.log(colors.yellow('Atualizando registros existentes...'));
    await sequelize.query("UPDATE payment_gateways SET \"apiEndpoint\" = 'https://app.unifypay.co' WHERE \"apiEndpoint\" IS NULL");
    
    console.log(colors.green('Registros atualizados com sucesso!'));
    
    process.exit(0);
  } catch (error) {
    console.error(colors.red('Erro ao adicionar a coluna apiEndpoint:'), error);
    process.exit(1);
  }
}

// Conectar ao banco de dados e executar a função
sequelize
  .authenticate()
  .then(() => {
    console.log(colors.green('Conexão com o banco de dados estabelecida com sucesso.'));
    addApiEndpointColumn();
  })
  .catch((err) => {
    console.error(colors.red('Erro ao conectar ao banco de dados:'), err);
    process.exit(1);
  }); 