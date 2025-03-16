import Admin from '../models/Admin.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import jwt from 'jsonwebtoken';

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validar email e senha
  if (!email || !password) {
    return next(new ErrorResponse('Por favor, forneça email e senha', 400));
  }

  // Verificar se o admin existe
  const admin = await Admin.findOne({ where: { email } });

  if (!admin) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  // Verificar se a senha está correta
  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Credenciais inválidas', 401));
  }

  sendTokenResponse(admin, 200, res);
});

// @desc    Obter perfil do admin atual
// @route   GET /api/admin/profile
// @access  Private
export const getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findByPk(req.admin.id);

  if (!admin) {
    return next(new ErrorResponse('Administrador não encontrado', 404));
  }

  res.status(200).json({
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    }
  });
});

// @desc    Criar admin (apenas super_admin pode criar)
// @route   POST /api/admin/register
// @access  Private/SuperAdmin
export const registerAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Verificar se o usuário atual é super_admin
  if (req.admin.role !== 'super_admin') {
    return next(new ErrorResponse('Não autorizado a criar administradores', 403));
  }

  // Verificar se o email já está em uso
  const existingAdmin = await Admin.findOne({ where: { email } });
  if (existingAdmin) {
    return next(new ErrorResponse('Email já está em uso', 400));
  }

  // Criar admin
  const admin = await Admin.create({
    name,
    email,
    password,
    role: role || 'admin'
  });

  res.status(201).json({
    success: true,
    message: 'Administrador criado com sucesso'
  });
});

// Função auxiliar para enviar resposta com token
const sendTokenResponse = (admin, statusCode, res) => {
  // Criar token
  const token = admin.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('admin_token', token, options)
    .json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
}; 