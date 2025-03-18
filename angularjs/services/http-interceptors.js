/**
 * Interceptores HTTP para a aplicação
 * Adiciona token de autenticação e trata erros de resposta
 */

// Factory principal de HTTP Interceptors
angular.module('raspadinhaApp').factory('HttpInterceptors', ['$q', '$window', '$injector', 
function($q, $window, $injector) {
  return {
    // Intercepta requisições para adicionar token de autenticação
    request: function(config) {
      // Obter constantes via $injector para evitar dependência circular
      var APP_CONSTANTS = $injector.get('APP_CONSTANTS');
      
      // Adicionar token de autenticação se disponível
      var token = $window.localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
      }
      
      // Logging
      console.log('Requisição enviada:', config.method, config.url);
      
      return config;
    },
    
    // Intercepta respostas para logging
    response: function(response) {
      console.log('Resposta recebida:', response.status, response.config.url);
      return response;
    },
    
    // Intercepta erros para tratamento
    responseError: function(rejection) {
      console.error('Erro na requisição:', rejection.status, rejection.config?.url, rejection);
      
      // Obter serviços via $injector para evitar dependência circular
      var $location = $injector.get('$location');
      var APP_CONSTANTS = $injector.get('APP_CONSTANTS');
      
      // Se receber um erro 401 Unauthorized, redirecionar para o login
      if (rejection.status === 401) {
        // Usar $injector para evitar dependência circular
        var AuthService = $injector.get('AuthService');
        
        // Limpar token expirado
        AuthService.logout();
        
        // Redirecionar para página de login com mensagem
        $location.path('/login').search({ message: 'Sua sessão expirou. Por favor, faça login novamente.' });
      }
      
      // Se receber erro 403 Forbidden, mostrar mensagem de acesso negado
      if (rejection.status === 403) {
        var NotificationService = $injector.get('NotificationService');
        NotificationService.error('Acesso negado. Você não tem permissão para acessar este recurso.');
      }
      
      // Se receber erro 500 ou outro erro de servidor, mostrar mensagem genérica
      if (rejection.status >= 500) {
        var NotificationService = $injector.get('NotificationService');
        NotificationService.error(APP_CONSTANTS.ERROR_MESSAGES.SERVER_ERROR);
      }
      
      return $q.reject(rejection);
    }
  };
}]);