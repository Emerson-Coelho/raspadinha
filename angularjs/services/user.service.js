const app = angular.module('raspadinhaApp');
/**
 * Serviço para operações relacionadas a usuários
 */
app.service('UserService', ['$http', 'APP_CONSTANTS', 'AuthService', function($http, APP_CONSTANTS, AuthService) {
  var service = {};
  var baseUrl = APP_CONSTANTS.API_URL + '/users';
  var cachedUserBalance = null;
  var cachedUserProfile = null;
  
  // Obter o perfil do usuário atual
  service.getCurrentUserProfile = function(forceRefresh) {
    if (cachedUserProfile && !forceRefresh) {
      return Promise.resolve(cachedUserProfile);
    }
    
    return $http.get(baseUrl + '/me')
      .then(function(response) {
        cachedUserProfile = response.data;
        return cachedUserProfile;
      });
  };
  
  // Obter o saldo do usuário atual
  service.getUserBalance = function(forceRefresh) {
    if (cachedUserBalance !== null && !forceRefresh) {
      return Promise.resolve(cachedUserBalance);
    }
    
    return $http.get(baseUrl + '/me/balance')
      .then(function(response) {
        cachedUserBalance = response.data.balance;
        return cachedUserBalance;
      });
  };
  
  // Atualizar o perfil do usuário
  service.updateUserProfile = function(userData) {
    return $http.put(baseUrl + '/me', userData)
      .then(function(response) {
        // Atualizar o cache com os novos dados
        cachedUserProfile = response.data;
        return cachedUserProfile;
      });
  };
  
  // Alterar senha do usuário
  service.changePassword = function(currentPassword, newPassword) {
    return $http.put(baseUrl + '/me/password', {
      currentPassword: currentPassword,
      newPassword: newPassword
    });
  };
  
  // Obter o histórico de transações do usuário
  service.getTransactionHistory = function(params) {
    return $http.get(baseUrl + '/me/transactions', { params: params })
      .then(function(response) {
        return response.data;
      });
  };
  
  // Obter o histórico de jogos do usuário
  service.getGameHistory = function(params) {
    return $http.get(baseUrl + '/me/games', { params: params })
      .then(function(response) {
        return response.data;
      });
  };
  
  // Obter informações de um usuário pelo ID (apenas admin)
  service.getUserById = function(userId) {
    return $http.get(baseUrl + '/' + userId)
      .then(function(response) {
        return response.data;
      });
  };
  
  // Listar todos os usuários (apenas admin, paginado)
  service.listUsers = function(params) {
    return $http.get(baseUrl, { params: params })
      .then(function(response) {
        return response.data;
      });
  };
  
  // Obter estatísticas do usuário
  service.getUserStats = function() {
    return $http.get(baseUrl + '/me/stats')
      .then(function(response) {
        return response.data;
      });
  };
  
  // Obter vencedores recentes
  service.getRecentWinners = function(params) {
    return $http.get(APP_CONSTANTS.API_URL + '/winners', { params: params })
      .then(function(response) {
        return response.data;
      });
  };
  
  // Solicitar recuperação de senha
  service.requestPasswordReset = function(email) {
    return $http.post(APP_CONSTANTS.API_URL + '/auth/forgot-password', { email: email });
  };
  
  // Redefinir senha com token
  service.resetPassword = function(token, newPassword) {
    return $http.post(APP_CONSTANTS.API_URL + '/auth/reset-password', {
      token: token,
      newPassword: newPassword
    });
  };
  
  // Obter notificações do usuário
  service.getUserNotifications = function(params) {
    return $http.get(baseUrl + '/me/notifications', { params: params })
      .then(function(response) {
        return response.data;
      });
  };
  
  // Marcar notificação como lida
  service.markNotificationAsRead = function(notificationId) {
    return $http.put(baseUrl + '/me/notifications/' + notificationId + '/read');
  };
  
  // Obter lista de métodos de pagamento do usuário
  service.getPaymentMethods = function() {
    return $http.get(baseUrl + '/me/payment-methods')
      .then(function(response) {
        return response.data;
      });
  };
  
  // Adicionar um novo método de pagamento
  service.addPaymentMethod = function(paymentMethodData) {
    return $http.post(baseUrl + '/me/payment-methods', paymentMethodData)
      .then(function(response) {
        return response.data;
      });
  };
  
  // Remover um método de pagamento
  service.removePaymentMethod = function(paymentMethodId) {
    return $http.delete(baseUrl + '/me/payment-methods/' + paymentMethodId);
  };
  
  // Limpar caches quando o usuário fizer logout
  function clearCaches() {
    cachedUserBalance = null;
    cachedUserProfile = null;
  }
  
  // Registrar evento de logout para limpar caches
  AuthService.registerLogoutCallback(clearCaches);
  
  return service;
}]); 