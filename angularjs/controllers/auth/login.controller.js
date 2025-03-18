// Controller da página de login
export function LoginController($scope, $location, AuthService) {
  const vm = this;
  
  // Dados do controller
  vm.credentials = {
    email: '',
    password: ''
  };
  vm.isLoading = false;
  vm.error = null;
  
  // Métodos
  vm.login = login;
  
  // Implementação
  function login() {
    // Validação básica
    if (!vm.credentials.email || !vm.credentials.password) {
      vm.error = 'Por favor, preencha todos os campos.';
      return;
    }
    
    vm.isLoading = true;
    vm.error = null;
    
    AuthService.login(vm.credentials)
      .then(() => {
        // Redirecionar para a página principal após login
        $location.path('/');
      })
      .catch(error => {
        console.error('Erro no login:', error);
        if (error.data && error.data.message) {
          vm.error = error.data.message;
        } else {
          vm.error = 'Credenciais inválidas. Por favor, tente novamente.';
        }
      })
      .finally(() => {
        vm.isLoading = false;
      });
  }
}

// Injeção de dependências
LoginController.$inject = ['$scope', '$location', 'AuthService']; 