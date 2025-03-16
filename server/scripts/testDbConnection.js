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

async function testDbConnection() {
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

    // Testar a busca por ID
    const adminId = process.argv[2] || 'e9e6395d-954c-43c8-af0c-2a79e0a56a88';
    console.log(`Buscando administrador com ID: ${adminId}`);
    
    const admin = await Admin.findByPk(adminId);
    
    if (admin) {
      console.log('Administrador encontrado:');
      console.log(`ID: ${admin.id}`);
      console.log(`Nome: ${admin.name}`);
      console.log(`Email: ${admin.email}`);
      console.log(`Função: ${admin.role}`);
    } else {
      console.log(`Administrador com ID ${adminId} não encontrado.`);
      
      // Listar todos os administradores
      console.log('\nListando todos os administradores:');
      const allAdmins = await Admin.findAll();
      
      if (allAdmins.length === 0) {
        console.log('Nenhum administrador encontrado no banco de dados.');
      } else {
        allAdmins.forEach(a => {
          console.log(`- ${a.id}: ${a.name} (${a.email})`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao testar conexão com o banco de dados:', error);
    process.exit(1);
  }
}

testDbConnection(); 