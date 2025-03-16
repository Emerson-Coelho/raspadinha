import express from 'express';
const router = express.Router();

// Dados simulados para desenvolvimento
const users = [
  {
    id: '1',
    name: 'Usuário Teste',
    email: 'usuario@teste.com',
    password: 'senha123',
    phone: '(11) 99999-9999',
    cpf: '123.456.789-00',
    role: 'admin',
    balance: 100,
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'senha123',
    phone: '(21) 98888-7777',
    cpf: '987.654.321-00',
    role: 'user',
    balance: 50,
  }
];

// Rota de login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Verificar se o email e senha foram fornecidos
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }
  
  // Buscar usuário pelo email
  const user = users.find(u => u.email === email);
  
  // Verificar se o usuário existe e a senha está correta
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Email ou senha incorretos' });
  }
  
  // Criar um objeto de usuário sem a senha
  const userWithoutPassword = { ...user };
  delete userWithoutPassword.password;
  
  // Simular um token JWT
  const token = `fake-jwt-token-${Date.now()}`;
  
  // Retornar os dados do usuário e o token
  res.json({
    token,
    user: userWithoutPassword
  });
});

// Rota de registro
router.post('/register', (req, res) => {
  const { name, email, password, cpf, phone } = req.body;
  
  // Verificar se todos os campos obrigatórios foram fornecidos
  if (!name || !email || !password || !cpf || !phone) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
  }
  
  // Verificar se o email já está em uso
  if (users.some(u => u.email === email)) {
    return res.status(400).json({ message: 'Este email já está em uso' });
  }
  
  // Verificar se o CPF já está em uso
  if (users.some(u => u.cpf === cpf)) {
    return res.status(400).json({ message: 'Este CPF já está em uso' });
  }
  
  // Criar um novo usuário
  const newUser = {
    id: (users.length + 1).toString(),
    name,
    email,
    password,
    cpf,
    phone,
    role: 'user',
    balance: 0
  };
  
  // Adicionar o novo usuário à lista (em um ambiente real, seria salvo no banco de dados)
  users.push(newUser);
  
  // Retornar uma mensagem de sucesso
  res.status(201).json({ message: 'Usuário registrado com sucesso' });
});

// Rota para obter o perfil do usuário
router.get('/profile', (req, res) => {
  // Em um ambiente real, você verificaria o token JWT e obteria o ID do usuário a partir dele
  // Aqui, estamos apenas simulando isso retornando o primeiro usuário
  
  const user = { ...users[0] };
  delete user.password;
  
  res.json({ user });
});

export default router; 