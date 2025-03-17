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
      const lastUser = await User.findOne({
        where: {
          email: {
            [Op.like]: 'usuario%@teste.com'
          }
        },
        order: [['email', 'DESC']],
        attributes: ['email']
      });
      
      if (lastUser) {
        const lastEmail = lastUser.email;
        const lastIndex = parseInt(lastEmail.replace('usuario', '').replace('@teste.com', ''));
        
        if (!isNaN(lastIndex)) {
          startIndex = lastIndex + 1;
          console.log(`Continuando a partir do índice ${startIndex}`);
        }
      }
    }
    
    // Senha padrão para todos os usuários
    const password = 'senha123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Função para gerar um CPF sequencial (sem validação)
    function generateCPF(index, attempt = 0) {
      // Gerar um CPF sequencial baseado no índice
      // Formato: 111.222.XXX-YY onde XXX é o índice formatado com zeros à esquerda
      // Se houver tentativas adicionais, modificamos o final para garantir unicidade
      const formattedIndex = String(index).padStart(3, '0');
      const suffix = attempt > 0 ? String(attempt).padStart(2, '0') : '00';
      return `111.222.${formattedIndex}-${suffix}`;
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
    let errorDetails = [];
    let createdIndices = new Set(); // Para rastrear quais índices foram criados com sucesso
    
    // Primeiro, verificar quais usuários já existem para evitar duplicatas
    console.log('Verificando usuários existentes...');
    const existingUsers = await User.findAll({
      where: {
        email: {
          [Op.like]: 'usuario%@teste.com'
        }
      },
      attributes: ['email']
    });
    
    const existingIndices = new Set();
    existingUsers.forEach(user => {
      const index = parseInt(user.email.replace('usuario', '').replace('@teste.com', ''));
      if (!isNaN(index) && index >= startIndex && index <= endIndex) {
        existingIndices.add(index);
      }
    });
    
    console.log(`Encontrados ${existingIndices.size} usuários existentes no intervalo solicitado.`);
    
    // Verificar CPFs existentes para evitar conflitos
    console.log('Verificando CPFs existentes...');
    const existingCPFs = new Set();
    const cpfResults = await sequelize.query('SELECT cpf FROM users');
    cpfResults[0].forEach(result => {
      existingCPFs.add(result.cpf);
    });
    
    console.log(`Encontrados ${existingCPFs.size} CPFs existentes no banco de dados.`);
    
    // Criar usuários em ordem sequencial
    for (let currentIndex = startIndex; currentIndex <= endIndex; currentIndex++) {
      // Pular usuários que já existem
      if (existingIndices.has(currentIndex)) {
        continue;
      }
      
      try {
        const balance = parseFloat(getRandomNumber(0, 100000).toFixed(2));
        const role = Math.random() > 0.9 ? 'vip' : 'user'; // 10% dos usuários são VIP
        
        // Garantir que o status use apenas os valores permitidos
        let status;
        const statusRandom = Math.random();
        if (statusRandom > 0.95) {
          status = 'suspended';
        } else if (statusRandom > 0.9) {
          status = 'inactive';
        } else {
          status = 'active';
        }
        
        const lastLogin = Math.random() > 0.2 ? getRandomDate() : null; // 80% dos usuários têm um último login
        const now = new Date();
        const userId = uuidv4();
        const userName = `Usuário Teste ${currentIndex}`;
        const email = `usuario${currentIndex}@teste.com`;
        let cpf = generateCPF(currentIndex);
        
        // Verificar se o CPF já existe e gerar um novo se necessário
        let attempt = 0;
        while (existingCPFs.has(cpf) && attempt < 10) {
          attempt++;
          cpf = generateCPF(currentIndex, attempt);
        }
        
        const phone = generatePhone();
        
        // Usar consulta parametrizada para evitar problemas de injeção SQL
        const insertQuery = `
          INSERT INTO users (
            id, name, email, password, cpf, phone, balance, role, status, "lastLogin", "createdAt", "updatedAt"
          ) VALUES (
            :id, :name, :email, :password, :cpf, :phone, :balance, :role, :status, :lastLogin, :createdAt, :updatedAt
          )
          ON CONFLICT (email) DO NOTHING
        `;
        
        await sequelize.query(insertQuery, {
          replacements: {
            id: userId,
            name: userName,
            email: email,
            password: hashedPassword,
            cpf: cpf,
            phone: phone,
            balance: balance,
            role: role,
            status: status,
            lastLogin: lastLogin || null,
            createdAt: now,
            updatedAt: now
          },
          type: sequelize.QueryTypes.INSERT
        });
        
        // Adicionar o CPF ao conjunto de CPFs existentes
        existingCPFs.add(cpf);
        
        totalCreated++;
        createdIndices.add(currentIndex);
        
        // Log de progresso a cada 1000 usuários, em vez de 100
        if (totalCreated % 1000 === 0) {
          console.log(`Progresso: ${totalCreated} usuários criados. Último: ${email}`);
        }
      } catch (error) {
        console.error(`Erro ao criar usuário usuario${currentIndex}@teste.com: ${error.message}`);
        errorDetails.push({
          email: `usuario${currentIndex}@teste.com`,
          error: error.message
        });
        totalErrors++;
        
        // Verificar se o erro é devido a restrição de chave única no CPF
        if (error.message.includes('unique constraint') && error.message.includes('cpf')) {
          // Tentar criar com um CPF diferente usando um offset maior
          const newBalance = Math.floor(Math.random() * 1000);
          const newRole = Math.random() > 0.9 ? 'vip' : 'user';
          
          // Garantir que o status use apenas os valores permitidos
          let newStatus;
          const statusRandom = Math.random();
          if (statusRandom > 0.95) {
            newStatus = 'suspended';
          } else if (statusRandom > 0.9) {
            newStatus = 'inactive';
          } else {
            newStatus = 'active';
          }
          
          const newLastLogin = Math.random() > 0.5 ? new Date() : null;
          const newUserName = `Usuário Teste ${currentIndex}`;
          const newEmail = `usuario${currentIndex}@teste.com`;
          
          // Usar um offset maior para garantir um CPF único
          let newCpf = generateCPF(currentIndex, 100); // Começar com um offset grande para evitar colisões
          
          // Verificar se o novo CPF já existe e gerar outro se necessário
          let retryAttempt = 100;
          while (existingCPFs.has(newCpf) && retryAttempt < 110) {
            retryAttempt++;
            newCpf = generateCPF(currentIndex, retryAttempt);
          }
          
          const newPhone = generatePhone();
          
          const retryInsertQuery = `
            INSERT INTO users (
              id, name, email, password, cpf, phone, balance, role, status, "lastLogin", "createdAt", "updatedAt"
            ) VALUES (
              :id, :name, :email, :password, :cpf, :phone, :balance, :role, :status, :lastLogin, :createdAt, :updatedAt
            )
            ON CONFLICT (email) DO NOTHING
          `;
          
          try {
            await sequelize.query(retryInsertQuery, {
              replacements: {
                id: userId,
                name: newUserName,
                email: newEmail,
                password: hashedPassword,
                cpf: newCpf,
                phone: newPhone,
                balance: newBalance,
                role: newRole,
                status: newStatus,
                lastLogin: newLastLogin || null,
                createdAt: now,
                updatedAt: now
              },
              type: sequelize.QueryTypes.INSERT
            });
            
            // Adicionar o novo CPF ao conjunto de CPFs existentes
            existingCPFs.add(newCpf);
            
            totalCreated++;
            totalErrors--; // Corrigir o contador de erros
            createdIndices.add(currentIndex);
          } catch (retryError) {
            console.error(`Falha na segunda tentativa para ${newEmail}: ${retryError.message}`);
          }
        }
      }
    }
    
    // Verificar se todos os usuários foram criados em sequência
    let missingIndices = [];
    for (let i = startIndex; i <= endIndex; i++) {
      if (!createdIndices.has(i) && !existingIndices.has(i)) {
        missingIndices.push(i);
      }
    }
    
    if (missingIndices.length > 0) {
      console.log(`Atenção: ${missingIndices.length} usuários não foram criados na sequência.`);
      if (missingIndices.length <= 10) {
        console.log(`Índices faltantes: ${missingIndices.join(', ')}`);
      } else {
        console.log(`Primeiros 10 índices faltantes: ${missingIndices.slice(0, 10).join(', ')}...`);
      }
    } else {
      console.log('Todos os usuários foram criados em sequência correta!');
    }
    
    console.log(`Criação de usuários concluída. Total criado: ${totalCreated}, Erros: ${totalErrors}`);
    
    // Incluir detalhes dos erros na resposta (limitado a 10 para não sobrecarregar)
    const errorSamples = errorDetails.slice(0, 10);
    
    res.status(200).json({
      success: true,
      message: `Criação de usuários concluída.`,
      created: totalCreated,
      errors: totalErrors,
      errorSamples: errorSamples.length > 0 ? errorSamples : undefined
    });
  } catch (error) {
    console.error('Erro ao criar usuários de teste:', error);
    return next(new ErrorResponse('Erro ao criar usuários de teste', 500));
  }
}); 