import PaymentGateway from '../models/PaymentGateway.js';

/**
 * Inicializa os gateways de pagamento no banco de dados
 */
export async function initializeGateways() {
  try {
    console.log('Inicializando gateways de pagamento...');
    
    // Verificar se o gateway UnifyPay já existe
    let unifyPay = await PaymentGateway.findByPk('unifypay');
    
    // Se não existir, criar
    if (!unifyPay) {
      console.log('Criando gateway UnifyPay...');
      unifyPay = await PaymentGateway.create({
        id: 'unifypay',
        name: 'UnifyPay',
        description: 'Processador de pagamentos para depósitos e saques via PIX e cartão.',
        logo: '/images/gateways/unifypay.png',
        isActive: false,
        publicKey: '',
        secretKey: '',
        forDeposit: true,
        forWithdraw: true,
        allowPix: true,
        allowCard: true
      });
      console.log('Gateway UnifyPay criado com sucesso!');
    } else {
      console.log('Gateway UnifyPay já existe.');
      
      // Verificar se os novos campos existem, se não, atualizar
      if (unifyPay.allowPix === undefined || unifyPay.allowCard === undefined) {
        await unifyPay.update({
          allowPix: true,
          allowCard: true
        });
        console.log('Gateway UnifyPay atualizado com novos campos.');
      }
    }
    
    // Aqui você pode adicionar mais gateways no futuro
    
    console.log('Inicialização de gateways concluída!');
  } catch (error) {
    console.error('Erro ao inicializar gateways de pagamento:', error);
  }
} 