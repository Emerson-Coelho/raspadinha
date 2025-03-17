import PaymentGateway from '../models/PaymentGateway.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';
import Admin from '../models/Admin.js';

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
  const { apiKeys, usageConfig, isActive, paymentMethods, apiEndpoint } = req.body;
  
  // Preparar dados para atualização
  const updateData = {};
  
  // Verificar se o usuário é super_admin para atualizar o endpoint da API
  if (apiEndpoint !== undefined) {
    // Verificar se o usuário é super_admin
    if (req.admin.role === 'super_admin') {
      updateData.apiEndpoint = apiEndpoint;
    } else {
      return next(new ErrorResponse('Apenas super administradores podem alterar o endpoint da API', 403));
    }
  }
  
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
  
  // Atualizar métodos de pagamento se fornecidos
  if (paymentMethods) {
    if (paymentMethods.allowPix !== undefined) {
      updateData.allowPix = paymentMethods.allowPix;
    }
    if (paymentMethods.allowCard !== undefined) {
      updateData.allowCard = paymentMethods.allowCard;
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
      apiEndpoint: 'https://app.unifypay.co',
      publicKey: '',
      secretKey: '',
      forDeposit: true,
      forWithdraw: true,
      allowPix: true,
      allowCard: true
    });
  }
  
  // Verificar se o gateway BSPay já existe
  let bspay = await PaymentGateway.findByPk('bspay');
  
  // Se não existir, criar
  if (!bspay) {
    bspay = await PaymentGateway.create({
      id: 'bspay',
      name: 'BSPay',
      description: 'Gateway de pagamento BSPay',
      logo: '/images/gateways/bspay.png',
      isActive: true,
      apiEndpoint: 'https://api.bspay.co',
      publicKey: '',
      secretKey: '',
      forDeposit: true,
      forWithdraw: true,
      allowPix: true,
      allowCard: false
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

/**
 * @desc    Obter gateways de pagamento ativos para autenticação direta (para jogadores)
 * @route   GET /api/payment-gateways/active-direct-auth
 * @access  Privado (Usuário)
 */
export const getActiveDirectAuthGateways = asyncHandler(async (req, res, next) => {
  try {
    console.log('Buscando gateways ativos para jogadores...');
    console.log('Usuário autenticado:', req.user.id, req.user.name);
    
    // Buscar gateways ativos
    const gateways = await PaymentGateway.findAll({
      where: {
        isActive: true
      }
    });
    
    console.log(`Encontrados ${gateways.length} gateways ativos`);
    
    // Filtrar informações sensíveis antes de enviar para o cliente
    const safeGateways = gateways.map(gateway => {
      // Usar o método toJSON do modelo para obter o formato correto
      const gatewayData = gateway.toJSON();
      
      // Remover chaves de API sensíveis
      delete gatewayData.apiKeys.secretKey;
      
      return {
        id: gatewayData.id,
        name: gatewayData.name,
        displayName: gatewayData.name,
        description: gatewayData.description,
        logoUrl: gatewayData.logo,
        paymentMethods: gatewayData.paymentMethods,
        usageConfig: gatewayData.usageConfig,
        isActive: gatewayData.isActive,
        minDeposit: 10, // Valores padrão
        maxDeposit: 5000,
        minWithdraw: 50,
        maxWithdraw: 5000,
        depositFee: 0,
        withdrawFee: 0
      };
    });
    
    console.log('Enviando resposta com gateways filtrados');
    
    res.status(200).json({
      success: true,
      count: safeGateways.length,
      gateways: safeGateways
    });
  } catch (error) {
    console.error('Erro ao buscar gateways ativos:', error);
    return next(error);
  }
}); 