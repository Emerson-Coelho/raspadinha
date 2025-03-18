// Controller da página de perfil do usuário
export function ProfileController($scope, AuthService, UserService, GameService) {
  const vm = this;
  
  // Dados do controller
  vm.user = AuthService.user;
  vm.profileData = {};
  vm.passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  vm.gameHistory = [];
  vm.transactions = [];
  vm.isLoading = {
    profile: false,
    password: false,
    gameHistory: false,
    transactions: false
  };
  vm.errors = {
    profile: null,
    password: null,
    gameHistory: null,
    transactions: null
  };
  vm.success = {
    profile: null,
    password: null
  };
  vm.activeTab = 'profile';
  
  // Métodos
  vm.updateProfile = updateProfile;
  vm.updatePassword = updatePassword;
  vm.setActiveTab = setActiveTab;
  
  // Inicialização
  initialize();
  
  function initialize() {
    // Carregar perfil do usuário
    loadUserProfile();
    
    // Carregar histórico de jogos
    loadGameHistory();
    
    // Carregar transações
    loadTransactions();
  }
  
  function loadUserProfile() {
    vm.isLoading.profile = true;
    vm.errors.profile = null;
    
    UserService.getUserProfile()
      .then(user => {
        vm.user = user;
        vm.profileData = {
          name: user.name,
          email: user.email,
          phone: user.phone || ''
        };
        vm.isLoading.profile = false;
      })
      .catch(error => {
        console.error('Erro ao carregar perfil do usuário:', error);
        vm.errors.profile = 'Ocorreu um erro ao carregar seu perfil. Por favor, tente novamente.';
        vm.isLoading.profile = false;
      });
  }
  
  function loadGameHistory() {
    vm.isLoading.gameHistory = true;
    vm.errors.gameHistory = null;
    
    GameService.getGameHistory()
      .then(history => {
        vm.gameHistory = history;
        vm.isLoading.gameHistory = false;
      })
      .catch(error => {
        console.error('Erro ao carregar histórico de jogos:', error);
        vm.errors.gameHistory = 'Ocorreu um erro ao carregar seu histórico de jogos. Por favor, tente novamente.';
        vm.isLoading.gameHistory = false;
      });
  }
  
  function loadTransactions() {
    vm.isLoading.transactions = true;
    vm.errors.transactions = null;
    
    UserService.getUserTransactions()
      .then(transactions => {
        vm.transactions = transactions;
        vm.isLoading.transactions = false;
      })
      .catch(error => {
        console.error('Erro ao carregar transações:', error);
        vm.errors.transactions = 'Ocorreu um erro ao carregar suas transações. Por favor, tente novamente.';
        vm.isLoading.transactions = false;
      });
  }
  
  function updateProfile() {
    // Validação básica
    if (!vm.profileData.name || !vm.profileData.email) {
      vm.errors.profile = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }
    
    vm.isLoading.profile = true;
    vm.errors.profile = null;
    vm.success.profile = null;
    
    UserService.updateUserProfile(vm.profileData)
      .then(response => {
        // Atualizar dados do usuário no serviço
        vm.user = Object.assign({}, vm.user, vm.profileData);
        AuthService.user = vm.user;
        
        vm.success.profile = 'Perfil atualizado com sucesso!';
        vm.isLoading.profile = false;
      })
      .catch(error => {
        console.error('Erro ao atualizar perfil:', error);
        if (error.data && error.data.message) {
          vm.errors.profile = error.data.message;
        } else {
          vm.errors.profile = 'Ocorreu um erro ao atualizar seu perfil. Por favor, tente novamente.';
        }
        vm.isLoading.profile = false;
      });
  }
  
  function updatePassword() {
    // Validação básica
    if (!vm.passwordData.currentPassword || !vm.passwordData.newPassword || !vm.passwordData.confirmPassword) {
      vm.errors.password = 'Por favor, preencha todos os campos.';
      return;
    }
    
    // Verificar se as senhas coincidem
    if (vm.passwordData.newPassword !== vm.passwordData.confirmPassword) {
      vm.errors.password = 'As senhas não coincidem.';
      return;
    }
    
    vm.isLoading.password = true;
    vm.errors.password = null;
    vm.success.password = null;
    
    const passwordData = {
      currentPassword: vm.passwordData.currentPassword,
      newPassword: vm.passwordData.newPassword
    };
    
    UserService.updatePassword(passwordData)
      .then(response => {
        vm.success.password = 'Senha atualizada com sucesso!';
        
        // Limpar campos de senha
        vm.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        
        vm.isLoading.password = false;
      })
      .catch(error => {
        console.error('Erro ao atualizar senha:', error);
        if (error.data && error.data.message) {
          vm.errors.password = error.data.message;
        } else {
          vm.errors.password = 'Ocorreu um erro ao atualizar sua senha. Por favor, tente novamente.';
        }
        vm.isLoading.password = false;
      });
  }
  
  function setActiveTab(tab) {
    vm.activeTab = tab;
  }
}

// Injeção de dependências
ProfileController.$inject = ['$scope', 'AuthService', 'UserService', 'GameService']; 