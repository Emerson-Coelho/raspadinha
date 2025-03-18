
// Controller de perfil do usuário
app.controller('ProfileController', ['$scope', '$state', 'AuthService', 'UserService', 'PaymentService',
  function($scope, $state, AuthService, UserService, PaymentService) {
    const vm = this;
    
    // Propriedades
    vm.user = null;
    vm.transactions = [];
    vm.gameHistory = [];
    vm.isLoading = true;
    vm.error = null;
    vm.activeTab = 'profile'; // 'profile', 'transactions', 'gameHistory', 'settings'
    
    // Formulários
    vm.profileForm = {
      fullName: '',
      email: '',
      phoneNumber: '',
      birthDate: null
    };
    
    vm.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    vm.depositForm = {
      amount: 50,
      paymentMethod: 'pix'
    };
    
    // Métodos públicos
    vm.changeTab = changeTab;
    vm.updateProfile = updateProfile;
    vm.updatePassword = updatePassword;
    vm.makeDeposit = makeDeposit;
    vm.logout = logout;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      vm.isLoading = true;
      
      // Obter perfil do usuário
      UserService.getUserProfile()
        .then(function(response) {
          vm.user = response;
          
          // Preencher formulário de perfil
          vm.profileForm.fullName = response.fullName;
          vm.profileForm.email = response.email;
          vm.profileForm.phoneNumber = response.phoneNumber;
          vm.profileForm.birthDate = response.birthDate ? new Date(response.birthDate) : null;
          
          return UserService.getUserTransactions();
        })
        .then(function(response) {
          vm.transactions = response;
          return GameService.getGameHistory();
        })
        .then(function(response) {
          vm.gameHistory = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar dados do perfil: ' + error.message;
          vm.isLoading = false;
          console.error('Erro ao carregar dados do perfil:', error);
        });
      
      // Carregar métodos de pagamento
      PaymentService.getPaymentMethods()
        .then(function(response) {
          vm.paymentMethods = response;
        })
        .catch(function(error) {
          console.error('Erro ao carregar métodos de pagamento:', error);
        });
    }
    
    function changeTab(tab) {
      vm.activeTab = tab;
    }
    
    function updateProfile() {
      vm.isLoading = true;
      vm.error = null;
      
      UserService.updateUserProfile(vm.profileForm)
        .then(function(response) {
          vm.user = response;
          vm.successMessage = 'Perfil atualizado com sucesso!';
        })
        .catch(function(error) {
          vm.error = error.data && error.data.message ? 
                    error.data.message : 
                    'Erro ao atualizar perfil. Tente novamente.';
          console.error('Erro ao atualizar perfil:', error);
        })
        .finally(function() {
          vm.isLoading = false;
        });
    }
    
    function updatePassword() {
      // Validar se as senhas são iguais
      if (vm.passwordForm.newPassword !== vm.passwordForm.confirmPassword) {
        vm.error = 'As senhas não coincidem.';
        return;
      }
      
      vm.isLoading = true;
      vm.error = null;
      
      UserService.updatePassword(vm.passwordForm)
        .then(function(response) {
          vm.successMessage = 'Senha atualizada com sucesso!';
          
          // Limpar formulário
          vm.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          };
        })
        .catch(function(error) {
          vm.error = error.data && error.data.message ? 
                    error.data.message : 
                    'Erro ao atualizar senha. Verifique sua senha atual e tente novamente.';
          console.error('Erro ao atualizar senha:', error);
        })
        .finally(function() {
          vm.isLoading = false;
        });
    }
    
    function makeDeposit() {
      vm.isLoading = true;
      vm.error = null;
      
      PaymentService.createDeposit(vm.depositForm)
        .then(function(response) {
          vm.successMessage = 'Depósito realizado com sucesso!';
          
          // Adicionar a nova transação à lista
          if (response.transaction) {
            vm.transactions.unshift(response.transaction);
          }
          
          // Atualizar saldo do usuário
          if (response.user) {
            vm.user = response.user;
          }
          
          // Limpar formulário
          vm.depositForm = {
            amount: 50,
            paymentMethod: 'pix'
          };
        })
        .catch(function(error) {
          vm.error = error.data && error.data.message ? 
                    error.data.message : 
                    'Erro ao realizar depósito. Tente novamente.';
          console.error('Erro ao realizar depósito:', error);
        })
        .finally(function() {
          vm.isLoading = false;
        });
    }
    
    function logout() {
      AuthService.logout();
    }
  }
]); 