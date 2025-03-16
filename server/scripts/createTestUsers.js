import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

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

// Função para gerar um número aleatório entre min e max
function getRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

// Função para gerar um CPF válido
function generateCPF(index) {
  // Usar o índice para garantir CPFs únicos
  const baseNumber = 10000000000 + index;
  const baseStr = baseNumber.toString().padStart(11, '0');
  
  const n1 = parseInt(baseStr[0]);
  const n2 = parseInt(baseStr[1]);
  const n3 = parseInt(baseStr[2]);
  const n4 = parseInt(baseStr[3]);
  const n5 = parseInt(baseStr[4]);
  const n6 = parseInt(baseStr[5]);
  const n7 = parseInt(baseStr[6]);
  const n8 = parseInt(baseStr[7]);
  const n9 = parseInt(baseStr[8]);
  
  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  
  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  
  return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
}

// Função para gerar um número de telefone
function generatePhone() {
  const ddd = Math.floor(Math.random() * 89) + 11; // DDD entre 11 e 99
  const part1 = Math.floor(Math.random() * 9000) + 1000;
  const part2 = Math.floor(Math.random() * 9000) + 1000;
  return `(${ddd}) 9${part1}-${part2}`;
}

// Função para gerar uma data aleatória nos últimos 30 dias
function getRandomDate() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
}

// Função para criar usuários em lote
async function createUsers() {
  try {
    console.log('Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('Conexão estabelecida com sucesso.');

    // Verificar se a tabela users existe
    const [tables] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    if (!tables.some(t => t.table_name === 'users')) {
      console.error('A tabela "users" não existe no banco de dados.');
      process.exit(1);
    }

    // Senha padrão para todos os usuários
    const password = 'senha123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Obter o número de usuários a serem criados a partir dos argumentos da linha de comando
    const args = process.argv.slice(2);
    const userCountArg = args.find(arg => arg.startsWith('--count='));
    const TOTAL_USERS = userCountArg ? parseInt(userCountArg.split('=')[1]) : 300000;
    
    if (isNaN(TOTAL_USERS) || TOTAL_USERS <= 0) {
      console.error('Número de usuários inválido. Use --count=N para especificar um número válido.');
      process.exit(1);
    }

    // Verificar se devemos continuar a partir do último usuário
    const continueArg = args.includes('--continue');
    let startIndex = 1;
    
    if (continueArg) {
      console.log('Verificando usuários existentes...');
      const [result] = await sequelize.query(`
        SELECT email FROM users 
        WHERE email LIKE 'usuario%@teste.com' 
        ORDER BY email DESC 
        LIMIT 1
      `);
      
      if (result.length > 0) {
        const lastEmail = result[0].email;
        const lastIndex = parseInt(lastEmail.replace('usuario', '').replace('@teste.com', ''));
        
        if (!isNaN(lastIndex)) {
          startIndex = lastIndex + 1;
          console.log(`Continuando a partir do índice ${startIndex}`);
        }
      }
    }

    const BATCH_SIZE = 1000; // Inserir 1000 usuários por vez
    const endIndex = startIndex + TOTAL_USERS - 1;
    const TOTAL_BATCHES = Math.ceil(TOTAL_USERS / BATCH_SIZE);

    console.log(`Iniciando criação de ${TOTAL_USERS} usuários (${startIndex} a ${endIndex}) em ${TOTAL_BATCHES} lotes...`);

    let totalCreated = 0;
    let totalErrors = 0;

    for (let batch = 0; batch < TOTAL_BATCHES; batch++) {
      const batchStartIndex = startIndex + (batch * BATCH_SIZE);
      const batchEndIndex = Math.min(startIndex + ((batch + 1) * BATCH_SIZE) - 1, endIndex);
      
      console.log(`Processando lote ${batch + 1}/${TOTAL_BATCHES} (usuários ${batchStartIndex} a ${batchEndIndex})...`);
      
      const usersToInsert = [];
      
      for (let i = batchStartIndex; i <= batchEndIndex; i++) {
        const balance = parseFloat(getRandomNumber(0, 100000).toFixed(2));
        const role = Math.random() > 0.9 ? 'vip' : 'user'; // 10% dos usuários são VIP
        const status = Math.random() > 0.05 ? 'active' : (Math.random() > 0.5 ? 'inactive' : 'suspended'); // 95% ativos, 2.5% inativos, 2.5% suspensos
        const lastLogin = Math.random() > 0.2 ? getRandomDate() : null; // 80% dos usuários têm um último login
        const now = new Date();
        
        usersToInsert.push({
          id: uuidv4(),
          name: `Usuário Teste ${i}`,
          email: `usuario${i}@teste.com`,
          password: hashedPassword,
          cpf: generateCPF(i),
          phone: generatePhone(),
          balance: balance,
          role: role,
          status: status,
          lastLogin: lastLogin,
          createdAt: now,
          updatedAt: now
        });
      }
      
      try {
        // Inserir usuários em lote
        await sequelize.query(`
          INSERT INTO users (
            id, name, email, password, cpf, phone, balance, role, status, "lastLogin", "createdAt", "updatedAt"
          ) VALUES ${usersToInsert.map(user => `(
            '${user.id}', 
            '${user.name}', 
            '${user.email}', 
            '${user.password}', 
            '${user.cpf}', 
            '${user.phone}', 
            ${user.balance}, 
            '${user.role}', 
            '${user.status}', 
            ${user.lastLogin ? `'${user.lastLogin.toISOString()}'` : 'NULL'}, 
            '${user.createdAt.toISOString()}', 
            '${user.updatedAt.toISOString()}'
          )`).join(', ')}
          ON CONFLICT (email) DO NOTHING
        `);
        
        totalCreated += usersToInsert.length;
        console.log(`Lote ${batch + 1}/${TOTAL_BATCHES} concluído.`);
      } catch (error) {
        console.error(`Erro ao inserir lote ${batch + 1}:`, error.message);
        
        // Tentar inserir um por um para identificar quais estão causando problemas
        console.log('Tentando inserir usuários individualmente...');
        for (const user of usersToInsert) {
          try {
            await sequelize.query(`
              INSERT INTO users (
                id, name, email, password, cpf, phone, balance, role, status, "lastLogin", "createdAt", "updatedAt"
              ) VALUES (
                '${user.id}', 
                '${user.name}', 
                '${user.email}', 
                '${user.password}', 
                '${user.cpf}', 
                '${user.phone}', 
                ${user.balance}, 
                '${user.role}', 
                '${user.status}', 
                ${user.lastLogin ? `'${user.lastLogin.toISOString()}'` : 'NULL'}, 
                '${user.createdAt.toISOString()}', 
                '${user.updatedAt.toISOString()}'
              )
              ON CONFLICT (email) DO NOTHING
            `);
            totalCreated++;
          } catch (userError) {
            console.error(`Erro ao inserir usuário ${user.email}:`, userError.message);
            totalErrors++;
          }
        }
      }
    }

    console.log(`Criação de usuários concluída.`);
    console.log(`Total de usuários criados: ${totalCreated}`);
    if (totalErrors > 0) {
      console.log(`Total de erros: ${totalErrors}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
    process.exit(1);
  }
}

// Executar a função principal
createUsers(); 