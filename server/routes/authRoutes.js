import express from 'express';
import { login, register, getProfile, logout, refreshToken, generateToken } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Rotas públicas
router.post('/login', login);
router.post('/register', register);
router.post('/refresh-token', async (req, res) => {
  try {
    // Verificar se há um token nos cookies
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não encontrado'
      });
    }
    
    // Verificar o refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');
    
    // Buscar o usuário
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Sua conta está inativa ou suspensa'
      });
    }
    
    // Gerar um novo token
    const token = generateToken(user.id);
    
    // Enviar o novo token
    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    
    return res.status(401).json({
      success: false,
      message: 'Não foi possível renovar o token',
      error: error.message
    });
  }
});

// Rotas protegidas
router.get('/profile', protect, getProfile);
router.get('/logout', protect, logout);

export default router; 