import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Carregar variáveis de ambiente
if (fs.existsSync(join(rootDir, '.env'))) {
  dotenv.config({ path: join(rootDir, '.env') });
  console.log('Usando configuração de ambiente do servidor (.env)');
} else {
  dotenv.config();
  console.log('Usando variáveis de ambiente do sistema');
}

async function checkAdmin() {
  try {
    // Configuração do Sequelize
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    // Definir o modelo Admin
    const Admin = sequelize.define('Admin', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.ENUM('admin', 'super_admin'),
        defaultValue: 'admin'
      }
    }, {
      tableName: 'admins',
      timestamps: true
    });

    // Conectar ao banco de dados
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // Buscar todos os administradores
    const admins = await Admin.findAll();
    
    if (admins.length === 0) {
      console.log('Nenhum administrador encontrado no banco de dados.');
    } else {
      console.log(`Encontrados ${admins.length} administradores:`);
      admins.forEach(admin => {
        console.log(`ID: ${admin.id}`);
        console.log(`Nome: ${admin.name}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Função: ${admin.role}`);
        console.log('-------------------');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao verificar administradores:', error);
    process.exit(1);
  }
}

checkAdmin(); 