/**
 * Controlador da Página de Depósito
 * Gerencia operações de depósito de créditos na conta do usuário
 */
angular.module('raspadinhaApp').controller('DepositController', ['$scope', '$location', 'AuthService', 'PaymentService', 'NotificationService',
function($scope, $location, AuthService, PaymentService, NotificationService) {
  var vm = this;
  
  // Dados do formulário de depósito
  vm.depositData = {
    amount: null,
    paymentMethod: null
  };
  
  // Controle de estado
  vm.isLoading = false;
  vm.currentStep = 1;
  vm.totalSteps = 3;
  vm.paymentMethods = [];
  vm.errorMessage = null;
  vm.transactionId = null;
  
  // Constantes para métodos de pagamento
  vm.PAYMENT_METHODS = {
    PIX: 'pix',
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    BANK_TRANSFER: 'bank_transfer',
    CRYPTO: 'crypto'
  };
  
  // Valores predefinidos para depósito rápido
  vm.predefinedAmounts = [
    { value: 10, label: 'R$ 10,00' },
    { value: 20, label: 'R$ 20,00' },
    { value: 50, label: 'R$ 50,00' },
    { value: 100, label: 'R$ 100,00' },
    { value: 200, label: 'R$ 200,00' }
  ];
  
  /**
   * Inicialização do controlador
   */
  function init() {
    // Verificar se o usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      NotificationService.warning('Você precisa estar logado para fazer um depósito');
      $location.path('/login');
      return;
    }
    
    loadPaymentMethods();
  }
  
  /**
   * Carrega os métodos de pagamento disponíveis
   */
  function loadPaymentMethods() {
    vm.isLoading = true;
    
    PaymentService.getPaymentMethods()
      .then(function(response) {
        vm.paymentMethods = response.methods || [];
      })
      .catch(function(error) {
        vm.errorMessage = 'Não foi possível carregar os métodos de pagamento. Por favor, tente novamente.';
        NotificationService.error('Erro ao carregar métodos de pagamento');
      })
      .finally(function() {
        vm.isLoading = false;
      });
  }
  
  /**
   * Seleciona um valor predefinido para depósito
   * @param {number} amount - Valor em reais
   */
  vm.selectAmount = function(amount) {
    vm.depositData.amount = amount;
  };
  
  /**
   * Seleciona o método de pagamento
   * @param {string} method - Código do método de pagamento
   */
  vm.selectPaymentMethod = function(method) {
    vm.depositData.paymentMethod = method;
  };
  
  /**
   * Avança para o próximo passo do depósito
   */
  vm.nextStep = function() {
    if (vm.currentStep === 1) {
      if (!vm.depositData.amount || vm.depositData.amount < 10) {
        NotificationService.warning('Por favor, selecione ou informe um valor mínimo de R$ 10,00');
        return;
      }
    } else if (vm.currentStep === 2) {
      if (!vm.depositData.paymentMethod) {
        NotificationService.warning('Por favor, selecione um método de pagamento');
        return;
      }
      
      // Se está no passo 2 e tudo válido, processar o pagamento
      processPayment();
      return;
    }
    
    vm.currentStep++;
  };
  
  /**
   * Volta para o passo anterior
   */
  vm.previousStep = function() {
    if (vm.currentStep > 1) {
      vm.currentStep--;
    }
  };
  
  /**
   * Processa o pagamento com os dados informados
   */
  function processPayment() {
    vm.isLoading = true;
    
    PaymentService.createDeposit(vm.depositData)
      .then(function(response) {
        vm.transactionId = response.transactionId;
        vm.paymentDetails = response.paymentDetails;
        vm.currentStep++;
        NotificationService.success('Solicitação de depósito realizada com sucesso!');
      })
      .catch(function(error) {
        vm.errorMessage = error.data?.message || 'Erro ao processar o pagamento. Por favor, tente novamente.';
        NotificationService.error('Falha ao processar depósito');
      })
      .finally(function() {
        vm.isLoading = false;
      });
  }
  
  /**
   * Formata o valor para exibição em reais
   * @param {number} value - Valor a ser formatado
   * @returns {string} Valor formatado em reais
   */
  vm.formatCurrency = function(value) {
    if (!value && value !== 0) return '';
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  };
  
  /**
   * Retorna ao início para um novo depósito
   */
  vm.newDeposit = function() {
    vm.depositData = {
      amount: null,
      paymentMethod: null
    };
    vm.currentStep = 1;
    vm.errorMessage = null;
    vm.transactionId = null;
  };
  
  /**
   * Navega para a página de perfil/carteira
   */
  vm.goToWallet = function() {
    $location.path('/profile');
  };
  
  // Métodos públicos
  vm.selectAmount = vm.selectAmount;
  vm.selectPaymentMethod = vm.selectPaymentMethod;
  vm.nextStep = vm.nextStep;
  vm.previousStep = vm.previousStep;
  vm.formatCurrency = vm.formatCurrency;
  vm.newDeposit = vm.newDeposit;
  vm.goToWallet = vm.goToWallet;
  
  // Inicializa o controlador
  init();
}]); 