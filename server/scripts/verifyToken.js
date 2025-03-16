import jwt from 'jsonwebtoken';
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

// Token a ser verificado (substitua pelo seu token)
const token = process.argv[2];

if (!token) {
  console.error('Por favor, forneça um token como argumento.');
  process.exit(1);
}

try {
  console.log('Verificando token JWT...');
  console.log('JWT_SECRET:', process.env.JWT_SECRET || 'admin_secret_key');
  
  // Verificar token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
  
  console.log('Token decodificado com sucesso:');
  console.log(decoded);
  
  console.log('\nInformações importantes:');
  console.log('ID do usuário:', decoded.id);
  console.log('Função:', decoded.role);
  
  if (decoded.exp) {
    const expirationDate = new Date(decoded.exp * 1000);
    console.log('Data de expiração:', expirationDate.toLocaleString());
    
    const now = new Date();
    const isExpired = now > expirationDate;
    
    console.log('Token expirado?', isExpired ? 'Sim' : 'Não');
    
    if (!isExpired) {
      const timeLeft = Math.floor((expirationDate - now) / 1000 / 60 / 60);
      console.log('Tempo restante:', timeLeft, 'horas');
    }
  }
  
  process.exit(0);
} catch (err) {
  console.error('Erro ao verificar token:', err.name, err.message);
  process.exit(1);
} 