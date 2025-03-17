import PaymentGateway from '../models/PaymentGateway.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

/**
 * @desc    Obter todos os gateways de pagamento
 * @route   GET /api/admin/payment-gateways
 * @access  Privado (Admin)
 */
export const getPaymentGateways = asyncHandler(async (req, res, next) => {
  const gateways = await PaymentGateway.findAll();
  
  res.status(200).json({
    success: true,
    count: gateways.length,
    data: gateways
  });
});

/**
 * @desc    Obter um gateway de pagamento por ID
 * @route   GET /api/admin/payment-gateways/:id
 * @access  Privado (Admin)
 */
export const getPaymentGatewayById = asyncHandler(async (req, res, next) => {
  const gateway = await PaymentGateway.findByPk(req.params.id);
  
  if (!gateway) {
    return next(new ErrorResponse(`Gateway de pagamento com ID ${req.params.id} não encontrado`, 404));
  }
  
  res.status(200).json({
    success: true,
    data: gateway
  });
});

/**
 * @desc    Atualizar um gateway de pagamento
 * @route   PUT /api/admin/payment-gateways/:id
 * @access  Privado (Admin)
 */
export const updatePaymentGateway = asyncHandler(async (req, res, next) => {
  let gateway = await PaymentGateway.findByPk(req.params.id);
  
  if (!gateway) {
    return next(new ErrorResponse(`Gateway de pagamento com ID ${req.params.id} não encontrado`, 404));
  }
  
  // Extrair dados do corpo da requisição
  const { apiKeys, usageConfig, isActive } = req.body;
  
  // Preparar dados para atualização
  const updateData = {};
  
  // Atualizar chaves de API se fornecidas
  if (apiKeys) {
    if (apiKeys.publicKey !== undefined) {
      updateData.publicKey = apiKeys.publicKey;
    }
    if (apiKeys.secretKey !== undefined) {
      updateData.secretKey = apiKeys.secretKey;
    }
  }
  
  // Atualizar configurações de uso se fornecidas
  if (usageConfig) {
    if (usageConfig.forDeposit !== undefined) {
      updateData.forDeposit = usageConfig.forDeposit;
    }
    if (usageConfig.forWithdraw !== undefined) {
      updateData.forWithdraw = usageConfig.forWithdraw;
    }
  }
  
  // Atualizar status ativo se fornecido
  if (isActive !== undefined) {
    updateData.isActive = isActive;
  }
  
  // Atualizar gateway
  await gateway.update(updateData);
  
  // Recarregar gateway para obter dados atualizados
  gateway = await PaymentGateway.findByPk(req.params.id);
  
  res.status(200).json({
    success: true,
    data: gateway
  });
});

/**
 * @desc    Inicializar gateways de pagamento (criar se não existirem)
 * @route   POST /api/admin/payment-gateways/initialize
 * @access  Privado (Admin)
 */
export const initializePaymentGateways = asyncHandler(async (req, res, next) => {
  // Verificar se o gateway UnifyPay já existe
  let unifyPay = await PaymentGateway.findByPk('unifypay');
  
  // Se não existir, criar
  if (!unifyPay) {
    unifyPay = await PaymentGateway.create({
      id: 'unifypay',
      name: 'UnifyPay',
      description: 'Processador de pagamentos para depósitos e saques via PIX e cartão.',
      logo: '/images/gateways/unifypay.png',
      isActive: false,
      publicKey: '',
      secretKey: '',
      forDeposit: true,
      forWithdraw: true
    });
  }
  
  // Obter todos os gateways após a inicialização
  const gateways = await PaymentGateway.findAll();
  
  res.status(200).json({
    success: true,
    message: 'Gateways de pagamento inicializados com sucesso',
    count: gateways.length,
    data: gateways
  });
});

/**
 * @desc    Alternar o estado ativo de um gateway
 * @route   PATCH /api/admin/payment-gateways/:id/toggle-active
 * @access  Privado (Admin)
 */
export const toggleGatewayActive = asyncHandler(async (req, res, next) => {
  const gateway = await PaymentGateway.findByPk(req.params.id);
  
  if (!gateway) {
    return next(new ErrorResponse(`Gateway de pagamento com ID ${req.params.id} não encontrado`, 404));
  }
  
  // Alternar estado ativo
  await gateway.update({ isActive: !gateway.isActive });
  
  // Recarregar gateway para obter dados atualizados
  const updatedGateway = await PaymentGateway.findByPk(req.params.id);
  
  res.status(200).json({
    success: true,
    data: updatedGateway
  });
}); 