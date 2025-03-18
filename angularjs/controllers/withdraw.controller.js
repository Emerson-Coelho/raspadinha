/**
 * Controlador da Página de Saque
 * Gerencia operações de saque de créditos da conta do usuário
 */
angular.module('raspadinhaApp').controller('WithdrawController', ['$scope', '$location', 'AuthService', 'PaymentService', 'UserService', 'NotificationService',
function($scope, $location, AuthService, PaymentService, UserService, NotificationService) {
  var vm = this;
  
  // Dados do formulário de saque
  vm.withdrawData = {
    amount: null,
    withdrawMethod: null,
    accountInfo: {
      bank: null,
      agency: null,
      account: null,
      document: null,
      fullName: null,
      pixKey: null
    }
  };
  
  // Controle de estado
  vm.isLoading = false;
  vm.loadingBalance = true;
  vm.currentStep = 1;
  vm.totalSteps = 3;
  vm.withdrawMethods = [];
  vm.errorMessage = null;
  vm.transactionId = null;
  vm.userBalance = 0;
  vm.bankList = [];
  
  // Constantes para métodos de saque
  vm.WITHDRAW_METHODS = {
    PIX: 'pix',
    BANK_TRANSFER: 'bank_transfer',
    CRYPTO: 'crypto'
  };
  
  /**
   * Inicialização do controlador
   */
  function init() {
    // Verificar se o usuário está autenticado
    if (!AuthService.isAuthenticated()) {
      NotificationService.warning('Você precisa estar logado para fazer um saque');
      $location.path('/login');
      return;
    }
    
    loadUserBalance();
    loadWithdrawMethods();
    loadBankList();
  }
  
  /**
   * Carrega o saldo do usuário
   */
  function loadUserBalance() {
    vm.loadingBalance = true;
    
    UserService.getUserBalance(true)
      .then(function(balance) {
        vm.userBalance = balance;
      })
      .catch(function(error) {
        NotificationService.error('Erro ao carregar saldo da conta');
      })
      .finally(function() {
        vm.loadingBalance = false;
      });
  }
  
  /**
   * Carrega os métodos de saque disponíveis
   */
  function loadWithdrawMethods() {
    vm.isLoading = true;
    
    PaymentService.getWithdrawMethods()
      .then(function(response) {
        vm.withdrawMethods = response.methods || [];
      })
      .catch(function(error) {
        vm.errorMessage = 'Não foi possível carregar os métodos de saque. Por favor, tente novamente.';
        NotificationService.error('Erro ao carregar métodos de saque');
      })
      .finally(function() {
        vm.isLoading = false;
      });
  }
  
  /**
   * Carrega a lista de bancos disponíveis
   */
  function loadBankList() {
    PaymentService.getBankList()
      .then(function(response) {
        vm.bankList = response.banks || [];
      })
      .catch(function(error) {
        NotificationService.error('Erro ao carregar lista de bancos');
      });
  }
  
  /**
   * Seleciona o método de saque
   * @param {string} method - Código do método de saque
   */
  vm.selectWithdrawMethod = function(method) {
    vm.withdrawData.withdrawMethod = method;
  };
  
  /**
   * Configura o valor máximo para saque (todo o saldo)
   */
  vm.setMaxAmount = function() {
    vm.withdrawData.amount = vm.userBalance;
  };
  
  /**
   * Avança para o próximo passo do saque
   */
  vm.nextStep = function() {
    if (vm.currentStep === 1) {
      if (!vm.withdrawData.amount || vm.withdrawData.amount < 20) {
        NotificationService.warning('Por favor, informe um valor mínimo de R$ 20,00 para saque');
        return;
      }
      
      if (vm.withdrawData.amount > vm.userBalance) {
        NotificationService.warning('Saldo insuficiente para realizar este saque');
        return;
      }
    } else if (vm.currentStep === 2) {
      if (!vm.withdrawData.withdrawMethod) {
        NotificationService.warning('Por favor, selecione um método de saque');
        return;
      }
      
      // Validar dados da conta de acordo com o método selecionado
      if (vm.withdrawData.withdrawMethod === vm.WITHDRAW_METHODS.BANK_TRANSFER) {
        if (!vm.withdrawData.accountInfo.bank || 
            !vm.withdrawData.accountInfo.agency || 
            !vm.withdrawData.accountInfo.account || 
            !vm.withdrawData.accountInfo.fullName) {
          NotificationService.warning('Por favor, preencha todos os dados bancários');
          return;
        }
      } else if (vm.withdrawData.withdrawMethod === vm.WITHDRAW_METHODS.PIX) {
        if (!vm.withdrawData.accountInfo.pixKey) {
          NotificationService.warning('Por favor, informe a chave PIX');
          return;
        }
      }
      
      // Se está no passo 2 e tudo válido, processar o saque
      processWithdraw();
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
   * Processa o saque com os dados informados
   */
  function processWithdraw() {
    vm.isLoading = true;
    
    PaymentService.createWithdrawal(vm.withdrawData)
      .then(function(response) {
        vm.transactionId = response.transactionId;
        vm.withdrawDetails = response.withdrawDetails;
        vm.currentStep++;
        NotificationService.success('Solicitação de saque realizada com sucesso!');
      })
      .catch(function(error) {
        vm.errorMessage = error.data?.message || 'Erro ao processar o saque. Por favor, tente novamente.';
        NotificationService.error('Falha ao processar saque');
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
   * Navega para a página de perfil/carteira
   */
  vm.goToWallet = function() {
    $location.path('/profile');
  };
  
  // Métodos públicos
  vm.selectWithdrawMethod = vm.selectWithdrawMethod;
  vm.setMaxAmount = vm.setMaxAmount;
  vm.nextStep = vm.nextStep;
  vm.previousStep = vm.previousStep;
  vm.formatCurrency = vm.formatCurrency;
  vm.goToWallet = vm.goToWallet;
  
  // Inicializa o controlador
  init();
}]); 