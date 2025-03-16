import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// @desc    Registrar um novo usuário
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, cpf, phone } = req.body;

    // Verificar se todos os campos obrigatórios foram fornecidos
    if (!name || !email || !password || !cpf || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos os campos são obrigatórios' 
      });
    }

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ 
      where: { 
        email 
      } 
    });

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este email já está em uso' 
      });
    }

    // Verificar se o CPF já está em uso
    const cpfExists = await User.findOne({ 
      where: { 
        cpf 
      } 
    });

    if (cpfExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Este CPF já está em uso' 
      });
    }

    // Criar o usuário
    const user = await User.create({
      name,
      email,
      password,
      cpf,
      phone
    });

    // Responder com sucesso
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao registrar usuário',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email e senha são obrigatórios' 
      });
    }

    // Verificar se o usuário existe
    const user = await User.findOne({ 
      where: { 
        email 
      } 
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Verificar se a senha está correta
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou senha incorretos' 
      });
    }

    // Atualizar a data do último login
    user.lastLogin = new Date();
    await user.save();

    // Criar token JWT
    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();

    // Opções para o cookie
    const cookieOptions = {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 dia
      httpOnly: true
    };

    // Adicionar secure: true em produção
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    }

    // Criar resposta com cookie
    res.cookie('refreshToken', refreshToken, cookieOptions);

    // Enviar resposta
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Obter perfil do usuário atual
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou o usuário ao req
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Logout do usuário
// @route   GET /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // 10 segundos
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};

// @desc    Atualizar token
// @route   POST /api/auth/refresh-token
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de atualização não fornecido'
      });
    }

    // Verificar o token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key'
    );

    // Obter o usuário
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Gerar novo token
    const token = user.getSignedJwtToken();

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    res.status(401).json({
      success: false,
      message: 'Token de atualização inválido'
    });
  }
}; 