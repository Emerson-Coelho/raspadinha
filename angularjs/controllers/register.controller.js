/**
 * Controlador da Página de Cadastro
 * Gerencia o processo de registro de novos usuários
 */
angular.module('raspadinhaApp').controller('RegisterController', ['$scope', '$location', 'AuthService', 'NotificationService',
function($scope, $location, AuthService, NotificationService) {
  var vm = this;
  
  // Dados do formulário de cadastro
  vm.registerData = {
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };
  
  // Controle de estado
  vm.isLoading = false;
  vm.errorMessage = null;
  vm.successMessage = null;
  vm.passwordStrength = 0;

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
  }
  
  /**
   * Enviar formulário de cadastro
   */
  vm.register = function() {
    vm.isLoading = true;
    vm.errorMessage = null;
    
    // Validar dados do formulário
    if (!validateForm()) {
      vm.isLoading = false;
      return;
    }
    
    AuthService.register(vm.registerData)
      .then(function(response) {
        vm.successMessage = 'Cadastro realizado com sucesso! Você pode fazer login agora.';
        NotificationService.success('Conta criada com sucesso!');
        
        // Redirecionar para login após um breve delay
        setTimeout(function() {
          $location.path('/login');
          $scope.$apply();
        }, 2000);
      })
      .catch(function(error) {
        vm.errorMessage = error.data?.message || 'Ocorreu um erro ao criar sua conta. Por favor, tente novamente.';
        NotificationService.error('Falha ao criar conta');
      })
      .finally(function() {
        vm.isLoading = false;
      });
  };

  /**
   * Validar dados do formulário
   * @returns {boolean} Retorna verdadeiro se o formulário é válido
   */
  function validateForm() {
    // Validar campos obrigatórios
    if (!vm.registerData.fullName || !vm.registerData.email || !vm.registerData.password || !vm.registerData.confirmPassword) {
      vm.errorMessage = 'Por favor, preencha todos os campos obrigatórios';
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(vm.registerData.email)) {
      vm.errorMessage = 'Por favor, insira um endereço de email válido';
      return false;
    }
    
    // Validar senha
    if (vm.registerData.password.length < 6) {
      vm.errorMessage = 'A senha deve ter pelo menos 6 caracteres';
      return false;
    }
    
    // Confirmar senha
    if (vm.registerData.password !== vm.registerData.confirmPassword) {
      vm.errorMessage = 'As senhas não coincidem';
      return false;
    }
    
    // Verificar aceitação dos termos
    if (!vm.registerData.acceptTerms) {
      vm.errorMessage = 'Você precisa aceitar os termos e condições';
      return false;
    }
    
    return true;
  }
  
  /**
   * Verificar força da senha
   */
  vm.checkPasswordStrength = function() {
    const password = vm.registerData.password;
    
    if (!password) {
      vm.passwordStrength = 0;
      return;
    }
    
    let strength = 0;
    
    // Comprimento
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    
    // Complexidade
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    vm.passwordStrength = Math.min(5, strength);
  };
  
  /**
   * Navegar para a página de login
   */
  vm.goToLogin = function() {
    $location.path('/login');
  };
  
  // Métodos públicos
  vm.register = vm.register;
  vm.checkPasswordStrength = vm.checkPasswordStrength;
  vm.goToLogin = vm.goToLogin;
  
  // Inicializa o controlador
  init();
}]); 