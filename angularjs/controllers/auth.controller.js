const app = angular.module('raspadinhaApp');

// Controller de autenticação
app.controller('AuthController', ['$scope', '$state', 'AuthService', 
  function($scope, $state, AuthService) {
    const vm = this;
    
    // Propriedades
    vm.loginForm = {
      email: '',
      password: '',
      rememberMe: false
    };
    
    vm.registerForm = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    };
    
    vm.isLoading = false;
    vm.error = null;
    vm.successMessage = null;
    
    // Métodos públicos
    vm.login = login;
    vm.register = register;
    vm.goToRegister = goToRegister;
    vm.goToLogin = goToLogin;
    vm.resetForm = resetForm;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      // Verificar se já está autenticado
      if (AuthService.isLoggedIn()) {
        // Redirecionar para a página principal
        $state.go('home');
      }
    }
    
    function login() {
      vm.isLoading = true;
      vm.error = null;
      
      AuthService.login(vm.loginForm)
        .then(function(response) {
          vm.successMessage = 'Login realizado com sucesso!';
          $state.go('home');
        })
        .catch(function(error) {
          vm.error = error.data && error.data.message ? 
                    error.data.message : 
                    'Erro ao fazer login. Verifique suas credenciais.';
          console.error('Erro de login:', error);
        })
        .finally(function() {
          vm.isLoading = false;
        });
    }
    
    function register() {
      // Validar se as senhas são iguais
      if (vm.registerForm.password !== vm.registerForm.confirmPassword) {
        vm.error = 'As senhas não coincidem.';
        return;
      }
      
      // Validar aceitação dos termos
      if (!vm.registerForm.acceptTerms) {
        vm.error = 'Você precisa aceitar os termos de uso.';
        return;
      }
      
      vm.isLoading = true;
      vm.error = null;
      
      AuthService.register(vm.registerForm)
        .then(function(response) {
          vm.successMessage = 'Registro realizado com sucesso! Faça login para continuar.';
          $state.go('login');
        })
        .catch(function(error) {
          vm.error = error.data && error.data.message ? 
                    error.data.message : 
                    'Erro ao registrar usuário. Tente novamente.';
          console.error('Erro de registro:', error);
        })
        .finally(function() {
          vm.isLoading = false;
        });
    }
    
    function goToRegister() {
      resetForm();
      $state.go('register');
    }
    
    function goToLogin() {
      resetForm();
      $state.go('login');
    }
    
    function resetForm() {
      vm.error = null;
      vm.successMessage = null;
      
      vm.loginForm = {
        email: '',
        password: '',
        rememberMe: false
      };
      
      vm.registerForm = {
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false
      };
    }
  }
]); 