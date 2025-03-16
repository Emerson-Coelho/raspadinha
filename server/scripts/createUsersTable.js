import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import sequelize from '../config/database.js';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Carregar variáveis de ambiente
const envPath = join(rootDir, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function createUsersTable() {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // Verificar se a tabela users já existe
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    if (tables.some(t => t.table_name === 'users')) {
      console.log('A tabela "users" já existe no banco de dados.');
      process.exit(0);
    }

    console.log('Criando tabela "users"...');
    
    // Criar a tabela users
    await sequelize.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        role VARCHAR(10) NOT NULL DEFAULT 'user',
        status VARCHAR(10) NOT NULL DEFAULT 'active',
        "lastLogin" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP NOT NULL
      )
    `);

    // Criar índices para melhorar o desempenho
    await sequelize.query(`CREATE INDEX idx_users_email ON users(email)`);
    await sequelize.query(`CREATE INDEX idx_users_cpf ON users(cpf)`);
    await sequelize.query(`CREATE INDEX idx_users_role ON users(role)`);
    await sequelize.query(`CREATE INDEX idx_users_status ON users(status)`);

    console.log('Tabela "users" criada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar tabela "users":', error);
    process.exit(1);
  }
}

// Executar a função principal
createUsersTable(); 