import User from '../models/User.js';
import sequelize from '../config/database.js';

const createTestUser = async () => {
  try {
    console.log('Verificando conexão com o banco de dados...');
    
    // Sincronizar o modelo com o banco de dados
    try {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados com o banco de dados');
    } catch (err) {
      console.error('Erro ao sincronizar modelos:', err);
      process.exit(1);
    }
    
    // Verificar se já existe um usuário de teste
    const userExists = await User.findOne({ 
      where: { email: 'usuario@teste.com' } 
    });
    
    if (userExists) {
      console.log('Um usuário de teste já existe no sistema.');
      console.log(`Email: ${userExists.email}`);
      console.log(`Senha: senha123`);
      process.exit(0);
    }
    
    // Criar usuário de teste
    const user = await User.create({
      name: 'Usuário Teste',
      email: 'usuario@teste.com',
      password: 'senha123',
      cpf: '123.456.789-00',
      phone: '(11) 99999-9999',
      balance: 100.00
    });
    
    console.log('Usuário de teste criado com sucesso:');
    console.log(`Nome: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Senha: senha123`);
    console.log(`CPF: ${user.cpf}`);
    console.log(`Telefone: ${user.phone}`);
    console.log(`Saldo: R$ ${user.balance}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar usuário de teste:', error);
    process.exit(1);
  }
};

createTestUser(); 