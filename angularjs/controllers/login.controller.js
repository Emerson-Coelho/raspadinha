/**
 * Controlador da Página de Login
 * Gerencia o processo de autenticação de usuários
 */
angular.module('raspadinhaApp').controller('LoginController', ['$scope', '$location', 'AuthService', 'NotificationService',
function($scope, $location, AuthService, NotificationService) {
  var vm = this;
  
  // Dados do formulário de login
  vm.loginData = {
    email: '',
    password: '',
    rememberMe: false
  };
  
  // Controle de estado
  vm.isLoading = false;
  vm.errorMessage = null;
  vm.successMessage = null;
  
  /**
   * Inicialização do controlador
   */
  function init() {
    // Verificar se o usuário já está autenticado
    if (AuthService.isAuthenticated()) {
      NotificationService.info('Você já está conectado');
      $location.path('/');
      return;
    }
    
    // Verificar se há uma mensagem de redirecionamento
    const redirectMessage = $location.search().message;
    if (redirectMessage) {
      vm.errorMessage = decodeURIComponent(redirectMessage);
    }
  }
  
  /**
   * Enviar formulário de login
   */
  vm.login = function() {
    vm.isLoading = true;
    vm.errorMessage = null;
    
    if (!vm.loginData.email || !vm.loginData.password) {
      vm.errorMessage = 'Por favor, preencha todos os campos';
      vm.isLoading = false;
      return;
    }
    
    AuthService.login(vm.loginData)
      .then(function(response) {
        NotificationService.success('Login realizado com sucesso!');
        
        // Redirecionar para a página principal ou para a página que o usuário estava tentando acessar
        const returnUrl = $location.search().returnUrl;
        $location.path(returnUrl || '/');
        $location.search('returnUrl', null);
        $location.search('message', null);
      })
      .catch(function(error) {
        vm.errorMessage = error.data?.message || 'Nome de usuário ou senha incorretos. Por favor, tente novamente.';
        NotificationService.error('Falha ao fazer login');
      })
      .finally(function() {
        vm.isLoading = false;
      });
  };
  
  /**
   * Navegar para a página de cadastro
   */
  vm.goToRegister = function() {
    $location.path('/register');
  };
  
  /**
   * Navegar para a página de recuperação de senha
   */
  vm.goToForgotPassword = function() {
    $location.path('/forgot-password');
  };
  
  // Métodos públicos
  vm.login = vm.login;
  vm.goToRegister = vm.goToRegister;
  vm.goToForgotPassword = vm.goToForgotPassword;
  
  // Inicializa o controlador
  init();
}]); 