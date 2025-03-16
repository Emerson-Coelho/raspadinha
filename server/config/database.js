import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const projectRoot = join(rootDir, '..');

// Determinar se estamos em ambiente de produção
const isProduction = process.env.NODE_ENV === 'production';

// Carregar variáveis de ambiente
// Priorizar o arquivo .env na pasta server
if (fs.existsSync(join(rootDir, '.env'))) {
  // Use .env na pasta server
  dotenv.config({ path: join(rootDir, '.env') });
  console.log('Usando configuração de ambiente do servidor (.env)');
} else if (!isProduction && fs.existsSync(join(projectRoot, '.env.local'))) {
  // Em desenvolvimento, use .env.local na raiz do projeto como fallback
  dotenv.config({ path: join(projectRoot, '.env.local') });
  console.log('Usando configuração de ambiente local (.env.local)');
} else {
  // Fallback para variáveis de ambiente do sistema
  dotenv.config();
  console.log('Usando variáveis de ambiente do sistema');
}

// Configuração de SSL para o PostgreSQL
// O servidor PostgreSQL na Render requer SSL
const sslConfig = {
  require: true,
  rejectUnauthorized: false
};

// Função para criar uma conexão com o banco de dados PostgreSQL
const createConnection = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('URL do banco de dados PostgreSQL não encontrada nas variáveis de ambiente');
  }

  console.log('Tentando conectar ao PostgreSQL usando a URL:', process.env.DATABASE_URL);

  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: isProduction ? false : console.log,
      dialectOptions: {
        ssl: sslConfig
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    });
    
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso.');
    return sequelize;
  } catch (error) {
    console.error('Não foi possível conectar ao banco de dados PostgreSQL:', error);
    throw new Error('Falha ao conectar ao banco de dados PostgreSQL');
  }
};

// Exportar a conexão
let dbConnection;
try {
  dbConnection = await createConnection();
} catch (error) {
  console.error('Falha ao estabelecer conexão com o banco de dados:', error);
  throw error;
}

export default dbConnection; 