import PaymentGateway from '../models/PaymentGateway.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * @desc    Obter gateways de pagamento ativos
 * @route   GET /api/payment-gateways/active
 * @access  Privado (Usuário)
 */
export const getActiveGateways = asyncHandler(async (req, res, next) => {
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
}); 