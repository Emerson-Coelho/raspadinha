import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
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

async function createAdmin() {
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

    // Criptografar a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Criar o administrador
    const admin = await Admin.create({
      name: 'Administrador',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'super_admin'
    });

    console.log('Administrador criado com sucesso:', admin.toJSON());
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
    process.exit(1);
  }
}

createAdmin(); 