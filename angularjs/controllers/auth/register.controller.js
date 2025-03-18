// Controller da página de registro
export function RegisterController($scope, $location, AuthService) {
  const vm = this;
  
  // Dados do controller
  vm.userData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };
  vm.isLoading = false;
  vm.error = null;
  
  // Métodos
  vm.register = register;
  
  // Implementação
  function register() {
    // Validação básica
    if (!vm.userData.name || !vm.userData.email || !vm.userData.password) {
      vm.error = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }
    
    // Verificar se as senhas coincidem
    if (vm.userData.password !== vm.userData.confirmPassword) {
      vm.error = 'As senhas não coincidem.';
      return;
    }
    
    vm.isLoading = true;
    vm.error = null;
    
    // Remover campo de confirmação de senha antes de enviar
    const userData = {
      name: vm.userData.name,
      email: vm.userData.email,
      password: vm.userData.password
    };
    
    AuthService.register(userData)
      .then(() => {
        // Redirecionar para a página principal após registro
        $location.path('/');
      })
      .catch(error => {
        console.error('Erro no registro:', error);
        if (error.data && error.data.message) {
          vm.error = error.data.message;
        } else {
          vm.error = 'Ocorreu um erro durante o registro. Por favor, tente novamente.';
        }
      })
      .finally(() => {
        vm.isLoading = false;
      });
  }
}

// Injeção de dependências
RegisterController.$inject = ['$scope', '$location', 'AuthService']; 