import express from 'express';
import { getActiveGateways } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import PaymentGateway from '../models/PaymentGateway.js';

const router = express.Router();

// Rota para obter gateways ativos com autenticação direta (sem middleware)
router.get('/active-direct-auth', async (req, res) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
  }
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token não encontrado'
    });
  }
  
  try {
    // Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    
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
    
    // Buscar gateways ativos
    const gateways = await PaymentGateway.findAll({
      where: {
        isActive: true
      }
    });
    
    // Filtrar informações sensíveis antes de enviar para o cliente
    const safeGateways = gateways.map(gateway => {
      const gatewayData = gateway.toJSON();
      
      // Remover chaves de API
      delete gatewayData.apiKeys;
      
      return gatewayData;
    });
    
    res.status(200).json({
      success: true,
      count: safeGateways.length,
      data: safeGateways
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou erro ao buscar gateways',
      error: error.message
    });
  }
});

// Todas as rotas abaixo requerem autenticação de usuário
router.use(protect);

// Rotas para gateways de pagamento
router.get('/active', getActiveGateways);

export default router; 