import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import Admin from '../models/Admin.js';

// Proteger rotas
export const protect = asyncHandler(async (req, res, next) => {
  let token;
  console.log('Verificando autenticação de administrador');
  console.log('URL da requisição:', req.originalUrl);
  console.log('Método da requisição:', req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Authorization header:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Obter token do cabeçalho
    token = req.headers.authorization.split(' ')[1];
    console.log('Token obtido do cabeçalho de autorização:', token ? token.substring(0, 20) + '...' : 'undefined');
  } else if (req.cookies.admin_token) {
    // Obter token dos cookies
    token = req.cookies.admin_token;
    console.log('Token obtido dos cookies:', token ? token.substring(0, 20) + '...' : 'undefined');
  }

  // Verificar se o token existe
  if (!token) {
    console.log('Nenhum token fornecido');
    return next(new ErrorResponse('Não autorizado a acessar esta rota. Token não fornecido.', 401));
  }

  try {
    console.log('Verificando token JWT:', token ? token.substring(0, 20) + '...' : 'undefined');
    console.log('JWT_SECRET:', process.env.JWT_SECRET || 'admin_secret_key');
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'admin_secret_key');
    console.log('Token decodificado:', decoded);

    // Verificar se o ID pertence a um admin
    console.log('Buscando administrador com ID:', decoded.id);
    const admin = await Admin.findByPk(decoded.id);
    console.log('Resultado da busca:', admin ? 'Encontrado' : 'Não encontrado');

    if (!admin) {
      console.log('Administrador não encontrado com ID:', decoded.id);
      return next(new ErrorResponse('Não autorizado a acessar esta rota. Administrador não encontrado.', 401));
    }

    console.log('Administrador autenticado:', admin.name, '(ID:', admin.id, ')');
    // Adicionar admin ao request
    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    next();
  } catch (err) {
    console.error('Erro ao verificar token:', err.name, err.message);
    console.error('Stack trace:', err.stack);
    
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Sua sessão expirou. Por favor, faça login novamente.', 401));
    } else if (err.name === 'JsonWebTokenError') {
      return next(new ErrorResponse('Token inválido. Por favor, faça login novamente.', 401));
    }
    
    return next(new ErrorResponse('Não autorizado a acessar esta rota.', 401));
  }
});

// Conceder acesso a funções específicas
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.admin.role)) {
      return next(
        new ErrorResponse(
          `Função ${req.admin.role} não está autorizada a acessar esta rota`,
          403
        )
      );
    }
    next();
  };
}; 