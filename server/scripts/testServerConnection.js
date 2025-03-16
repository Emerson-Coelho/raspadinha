import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';

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

// Importar a conexão do banco de dados
import sequelize from '../config/database.js';
import Admin from '../models/Admin.js';

async function testServerConnection() {
  try {
    console.log('Testando conexão com o banco de dados...');
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
      
      // Testar a geração de token
      console.log('\nTestando geração de token JWT...');
      const token = admin.getSignedJwtToken();
      console.log(`Token gerado: ${token}`);
      
      // Testar a verificação de token
      console.log('\nTestando verificação de token JWT...');
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
        console.log('Token verificado com sucesso:');
        console.log(decoded);
        
        // Testar a busca do administrador com o ID do token
        console.log('\nBuscando administrador com ID do token...');
        const adminFromToken = await Admin.findByPk(decoded.id);
        
        if (adminFromToken) {
          console.log('Administrador encontrado a partir do token:');
          console.log(`ID: ${adminFromToken.id}`);
          console.log(`Nome: ${adminFromToken.name}`);
          console.log(`Email: ${adminFromToken.email}`);
          console.log(`Função: ${adminFromToken.role}`);
        } else {
          console.log(`Administrador com ID ${decoded.id} não encontrado a partir do token.`);
        }
      } catch (err) {
        console.error('Erro ao verificar token:', err);
      }
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

testServerConnection(); 