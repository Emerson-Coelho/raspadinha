import Admin from '../models/Admin.js';
import sequelize from '../config/database.js';

const createSuperAdmin = async () => {
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
    
    // Verificar se já existe um super_admin
    const adminExists = await Admin.findOne({ 
      where: { role: 'super_admin' } 
    });
    
    if (adminExists) {
      console.log('Um super administrador já existe no sistema.');
      console.log(`Email: ${adminExists.email}`);
      process.exit(0);
    }
    
    // Criar super_admin
    const admin = await Admin.create({
      name: 'Administrador Principal',
      email: 'admin@raspadinha.com',
      password: 'maiL@123',
      role: 'super_admin'
    });
    
    console.log('Super administrador criado com sucesso:');
    console.log(`Nome: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Senha: maiL@123`);
    console.log('IMPORTANTE: Altere esta senha após o primeiro login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao criar super administrador:', error);
    process.exit(1);
  }
};

createSuperAdmin(); 