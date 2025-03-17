/**
 * Adaptadores para diferentes gateways de pagamento
 * Cada adaptador converte os dados do nosso sistema para o formato esperado pelo gateway
 * e vice-versa.
 */

/**
 * Adaptador para o gateway UnifyPay
 */
export const UnifyPayAdapter = {
  // Determina a rota correta para depósitos
  getDepositRoute: (apiEndpoint, paymentMethod) => {
    if (paymentMethod === 'pix') {
      return `${apiEndpoint}/api/v1/gateway/pix/receive`;
    } else if (paymentMethod === 'card') {
      return `${apiEndpoint}/api/v1/gateway/card/receive`;
    }
    throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
  },
  
  // Determina a rota correta para saques
  getWithdrawRoute: (apiEndpoint, paymentMethod) => {
    if (paymentMethod === 'pix') {
      return `${apiEndpoint}/api/v1/gateway/pix/send`;
    } else if (paymentMethod === 'card') {
      return `${apiEndpoint}/api/v1/gateway/card/send`;
    }
    throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
  },
  
  // Determina a rota correta para verificação de status
  getStatusRoute: (apiEndpoint, transaction) => {
    if (transaction.type === 'deposit') {
      if (transaction.paymentMethod === 'pix') {
        return `${apiEndpoint}/api/v1/gateway/pix/status/${transaction.gatewayTransactionId}`;
      } else if (transaction.paymentMethod === 'card') {
        return `${apiEndpoint}/api/v1/gateway/card/status/${transaction.gatewayTransactionId}`;
      }
      return `${apiEndpoint}/api/v1/transactions/${transaction.gatewayTransactionId}`;
    } else if (transaction.type === 'withdraw') {
      if (transaction.paymentMethod === 'pix') {
        return `${apiEndpoint}/api/v1/gateway/pix/status/${transaction.gatewayTransactionId}`;
      } else if (transaction.paymentMethod === 'card') {
        return `${apiEndpoint}/api/v1/gateway/card/status/${transaction.gatewayTransactionId}`;
      }
      return `${apiEndpoint}/api/v1/payouts/${transaction.gatewayTransactionId}`;
    }
    return `${apiEndpoint}/api/v1/transactions/${transaction.gatewayTransactionId}`;
  },
  
  // Formata o payload para depósitos
  formatDepositPayload: (data) => {
    // Garantir que temos uma URL de callback válida
    const callbackUrl = data.callbackUrl && data.callbackUrl !== 'undefined/api/webhooks/unifypay/callback' 
      ? data.callbackUrl 
      : 'https://api.raspadinha.com.br/api/webhooks/unifypay/callback';
    
    // Formatar o documento removendo caracteres não numéricos
    const documentFormatted = data.customer.document.replace(/[^0-9]/g, '');
    
    // Determinar o tipo de cliente com base no tamanho do documento
    // CPF = 11 dígitos, CNPJ = 14 dígitos
    const clientType = documentFormatted.length === 11 ? 'individual' : 'company';
    
    // Criar o payload no formato esperado pela API
    return {
      amount: data.amount,
      currency: 'BRL',
      callbackUrl: callbackUrl,
      identifier: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      metadata: {
        transactionId: data.metadata.transactionId,
        userId: data.metadata.userId
      },
      client: {
        name: data.customer.name,
        email: `${data.customer.email}x`,
        document: documentFormatted,
        type: clientType,
        phone: data.customer.phone || '99999999999'
      },
      paymentMethod: data.paymentMethod // Adicionar o método de pagamento
    };
  },
  
  // Formata o payload para saques
  formatWithdrawPayload: (data) => {
    // Garantir que temos uma URL de callback válida
    const callbackUrl = data.callbackUrl && data.callbackUrl !== 'undefined/api/webhooks/unifypay/callback' 
      ? data.callbackUrl 
      : 'https://api.raspadinha.com.br/api/webhooks/unifypay/callback';
    
    // Formatar o documento removendo caracteres não numéricos
    const documentFormatted = data.recipient.document.replace(/[^0-9]/g, '');
    
    // Determinar o tipo de cliente com base no tamanho do documento
    // CPF = 11 dígitos, CNPJ = 14 dígitos
    const clientType = documentFormatted.length === 11 ? 'individual' : 'company';
    
    // Criar o payload base
    const payload = {
      amount: data.amount,
      currency: 'BRL',
      callbackUrl: callbackUrl,
      identifier: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      metadata: {
        transactionId: data.metadata.transactionId,
        userId: data.metadata.userId
      },
      client: {
        name: data.recipient.name,
        document: documentFormatted,
        type: clientType,
        phone: data.recipient.phone || ''
      },
      paymentMethod: data.paymentMethod
    };
    
    // Adicionar dados específicos do método de pagamento
    if (data.paymentMethod === 'pix') {
      payload.pixKey = data.pixKey;
      payload.pixKeyType = data.pixKeyType;
    } else if (data.paymentMethod === 'card') {
      payload.card = {
        number: data.card.number,
        name: data.card.name,
        bank: data.card.bank
      };
    }
    
    return payload;
  },
  
  // Formata os headers para requisições
  getHeaders: (secretKey) => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretKey}`
    };
  },
  
  // Mapeia o status do gateway para o status interno
  mapStatus: (gatewayStatus) => {
    if (gatewayStatus === 'completed') {
      return 'completed';
    } else if (gatewayStatus === 'failed') {
      return 'failed';
    } else if (gatewayStatus === 'cancelled') {
      return 'cancelled';
    }
    return 'pending';
  }
};

/**
 * Adaptador para o gateway Bspay
 */
export const BspayAdapter = {
  // Determina a rota correta para depósitos
  getDepositRoute: (apiEndpoint, paymentMethod) => {
    if (paymentMethod === 'pix') {
      return `${apiEndpoint}/v2/pix/qrcode`;
    }
    throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
  },
  
  // Determina a rota correta para saques
  getWithdrawRoute: (apiEndpoint, paymentMethod) => {
    if (paymentMethod === 'pix') {
      return `${apiEndpoint}/v2/pix/payment`;
    }
    throw new Error(`Método de pagamento não suportado: ${paymentMethod}`);
  },
  
  // Determina a rota correta para verificação de status
  getStatusRoute: (apiEndpoint, transaction) => {
    if (transaction.type === 'deposit' || transaction.type === 'withdraw') {
      return `${apiEndpoint}/v2/pix/status/${transaction.gatewayTransactionId}`;
    }
    return `${apiEndpoint}/v2/transactions/${transaction.gatewayTransactionId}`;
  },
  
  // Formata o payload para depósitos
  formatDepositPayload: (data) => {
    // Formatar o documento removendo caracteres não numéricos
    const documentFormatted = data.customer.document.replace(/[^0-9]/g, '');
    
    // Criar o payload no formato esperado pela API BSPay v2
    const payload = {
      amount: data.amount.toString(),
      external_id: data.metadata.transactionId.toString(),
      payerQuestion: `Depósito Raspadinha #${data.metadata.transactionId}`,
      payer: {
        name: data.customer.name,
        document: documentFormatted,
        email: data.customer.email
      },
      postbackUrl: data.callbackUrl
    };
    
    return payload;
  },
  
  // Formata o payload para saques
  formatWithdrawPayload: (data) => {
    // Formatar o documento removendo caracteres não numéricos
    const documentFormatted = data.recipient.document.replace(/[^0-9]/g, '');
    
    // Criar o payload para pagamento PIX (saque)
    const payload = {
      amount: data.amount.toString(),
      external_id: data.metadata.transactionId.toString(),
      key: data.pixKey,
      key_type: data.pixKeyType,
      description: `Saque Raspadinha #${data.metadata.transactionId}`,
      payer: {
        name: data.recipient.name,
        document: documentFormatted,
        email: data.recipient.email || ''
      },
      postbackUrl: data.callbackUrl
    };
    
    return payload;
  },
  
  // Formata os headers para requisições
  getHeaders: (secretKey) => {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${secretKey}`
    };
  },
  
  // Mapeia o status do gateway para o status interno
  mapStatus: (gatewayStatus) => {
    switch (gatewayStatus) {
      case 'approved':
      case 'paid':
      case 'completed':
      case '03': // BSPay v2: Pago
      case '04': // BSPay v2: Concluído
        return 'completed';
      case 'rejected':
      case 'failed':
      case '05': // BSPay v2: Falha
      case '06': // BSPay v2: Rejeitado
        return 'failed';
      case 'cancelled':
      case 'refunded':
      case '07': // BSPay v2: Cancelado
      case '08': // BSPay v2: Estornado
        return 'cancelled';
      case '01': // BSPay v2: Aguardando pagamento
      case '02': // BSPay v2: Em processamento
      default:
        return 'pending';
    }
  }
};

/**
 * Função para obter o adaptador correto com base no ID do gateway
 */
export const getGatewayAdapter = (gatewayId) => {
  switch (gatewayId) {
    case 'unifypay':
      return UnifyPayAdapter;
    case 'bspay':
      return BspayAdapter;
    default:
      throw new Error(`Gateway não suportado: ${gatewayId}`);
  }
}; 