import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import sequelize from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    Verificar status da tabela de usuários
// @route   GET /api/admin/developer/table-status
// @access  Private/SuperAdmin
export const getTableStatus = asyncHandler(async (req, res, next) => {
  try {
    console.log('Verificando status da tabela de usuários...');
    
    let userCount = 0;
    let lastEmail = '';
    
    try {
      // Obter contagem de usuários usando SQL direto
      const [countResult] = await sequelize.query("SELECT COUNT(*) as count FROM users");
      userCount = parseInt(countResult[0].count);
      console.log('Total de usuários:', userCount);
      
      // Obter último email de usuário de teste
      if (userCount > 0) {
        const [lastUserResult] = await sequelize.query(`
          SELECT email FROM users 
          WHERE email LIKE 'usuario%@teste.com' 
          ORDER BY email DESC 
          LIMIT 1
        `);
        
        if (lastUserResult.length > 0) {
          lastEmail = lastUserResult[0].email;
          console.log('Último email:', lastEmail);
        }
      }
    } catch (error) {
      console.error('Erro ao consultar dados da tabela users:', error);
    }
    
    res.status(200).json({
      success: true,
      exists: true,
      userCount,
      lastEmail
    });
  } catch (error) {
    console.error('Erro ao verificar status da tabela:', error);
    return next(new ErrorResponse('Erro ao verificar status da tabela de usuários', 500));
  }
});

// @desc    Criar usuários de teste
// @route   POST /api/admin/developer/create-users
// @access  Private/SuperAdmin
export const createTestUsers = asyncHandler(async (req, res, next) => {
  try {
    console.log('Iniciando criação de usuários de teste...');
    const { count = 10, batchSize = 1000, continueFromLast = false } = req.body;
    
    console.log(`Parâmetros: count=${count}, batchSize=${batchSize}, continueFromLast=${continueFromLast}`);
    
    // Verificar se o número de usuários é válido
    if (isNaN(count) || count <= 0 || count > 300000) {
      return res.status(400).json({
        success: false,
        message: 'Número de usuários inválido. Deve ser entre 1 e 300.000.'
      });
    }
    
    // Verificar se o tamanho do lote é válido
    if (isNaN(batchSize) || batchSize <= 0 || batchSize > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Tamanho do lote inválido. Deve ser entre 1 e 10.000.'
      });
    }
    
    // Determinar o índice inicial
    let startIndex = 1;
    
    if (continueFromLast) {
      console.log('Buscando último usuário para continuar a partir dele...');
      const [lastUserResult] = await sequelize.query(`
        SELECT email FROM users 
        WHERE email LIKE 'usuario%@teste.com' 
        ORDER BY email DESC 
        LIMIT 1
      `);
      
      if (lastUserResult.length > 0) {
        const lastEmail = lastUserResult[0].email;
        console.log('Último email encontrado:', lastEmail);
        const lastIndex = parseInt(lastEmail.replace('usuario', '').replace('@teste.com', ''));
        
        if (!isNaN(lastIndex)) {
          startIndex = lastIndex + 1;
          console.log('Índice inicial definido como:', startIndex);
        }
      }
    }
    
    // Senha padrão para todos os usuários
    const password = 'senha123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
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
    
    // Função para gerar um número aleatório entre min e max
    function getRandomNumber(min, max) {
      return Math.random() * (max - min) + min;
    }
    
    // Função para gerar uma data aleatória nos últimos 30 dias
    function getRandomDate() {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return new Date(thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime()));
    }
    
    // Criar usuários em lotes
    const endIndex = startIndex + parseInt(count) - 1;
    const totalBatches = Math.ceil(count / batchSize);
    
    console.log(`Criando ${count} usuários em ${totalBatches} lotes, de ${startIndex} até ${endIndex}`);
    
    let totalCreated = 0;
    let totalErrors = 0;
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const batchStartIndex = startIndex + (batch * batchSize);
      const batchEndIndex = Math.min(startIndex + ((batch + 1) * batchSize) - 1, endIndex);
      
      console.log(`Processando lote ${batch + 1}/${totalBatches} (${batchStartIndex} até ${batchEndIndex})`);
      
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
          lastLogin: lastLogin ? lastLogin.toISOString() : null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        });
      }
      
      try {
        // Inserir usuários em lote usando SQL direto
        const valuesSql = usersToInsert.map(user => `(
          '${user.id}', 
          '${user.name}', 
          '${user.email}', 
          '${user.password}', 
          '${user.cpf}', 
          '${user.phone}', 
          ${user.balance}, 
          '${user.role}', 
          '${user.status}', 
          ${user.lastLogin ? `'${user.lastLogin}'` : 'NULL'}, 
          '${user.createdAt}', 
          '${user.updatedAt}'
        )`).join(', ');
        
        await sequelize.query(`
          INSERT INTO users (
            id, name, email, password, cpf, phone, balance, role, status, "lastLogin", "createdAt", "updatedAt"
          ) VALUES ${valuesSql}
          ON CONFLICT (email) DO NOTHING
        `);
        
        totalCreated += usersToInsert.length;
        console.log(`Lote ${batch + 1} concluído. Total criado até agora: ${totalCreated}`);
      } catch (error) {
        console.error(`Erro ao inserir lote ${batch + 1}:`, error.message);
        
        // Tentar inserir um por um para identificar quais estão causando problemas
        console.log('Tentando inserir usuários um por um...');
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
                ${user.lastLogin ? `'${user.lastLogin}'` : 'NULL'}, 
                '${user.createdAt}', 
                '${user.updatedAt}'
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
    
    console.log(`Criação de usuários concluída. Total criado: ${totalCreated}, Erros: ${totalErrors}`);
    
    res.status(200).json({
      success: true,
      message: `Criação de usuários concluída.`,
      created: totalCreated,
      errors: totalErrors
    });
  } catch (error) {
    console.error('Erro ao criar usuários de teste:', error);
    return next(new ErrorResponse('Erro ao criar usuários de teste', 500));
  }
}); 