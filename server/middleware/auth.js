import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware para proteger rotas
export const protect = async (req, res, next) => {
  let token;

  // Verificar se o token está no cabeçalho Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obter token do cabeçalho
    token = req.headers.authorization.split(' ')[1];
  }
  // Verificar se o token está nos cookies
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Verificar se o token está no localStorage (enviado como header personalizado)
  else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }

  // Verificar se o token existe
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Não autorizado para acessar esta rota'
    });
  }

  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');

    // Adicionar o usuário ao request
    req.user = await User.findByPk(decoded.id);

    // Verificar se o usuário existe
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se o usuário está ativo
    if (req.user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Sua conta está inativa ou suspensa'
      });
    }

    next();
  } catch (error) {
    // Verificar se o erro é de token expirado
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido',
        error: 'jwt expired'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Não autorizado para acessar esta rota'
    });
  }
};

// Middleware para verificar permissões de usuário
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar esta rota'
      });
    }
    next();
  };
}; 