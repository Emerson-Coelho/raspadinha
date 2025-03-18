/**
 * Serviço de Notificações
 * Gerencia exibição de mensagens de sucesso, erro, alerta e informação
 */
angular.module('raspadinhaApp').factory('NotificationService', ['$rootScope', '$timeout', 
function($rootScope, $timeout) {
  // Array para armazenar notificações ativas
  var notifications = [];
  var notificationId = 0;
  
  // Duração padrão das notificações em milissegundos
  var defaultDuration = 5000;
  
  // Expôr notificações ao rootScope para acesso nas views
  $rootScope.notifications = notifications;
  
  return {
    /**
     * Adiciona uma notificação
     * @param {string} type - Tipo da notificação (success, error, warning, info)
     * @param {string} message - Mensagem a ser exibida
     * @param {number} [duration] - Duração em ms (opcional, usa o padrão se não informado)
     * @returns {number} ID da notificação para controle
     */
    add: function(type, message, duration) {
      var id = ++notificationId;
      var notification = {
        id: id,
        type: type,
        message: message,
        show: true,
        timestamp: new Date()
      };
      
      notifications.push(notification);
      
      // Se a duração for fornecida, use-a, caso contrário use a duração padrão
      var notificationDuration = duration || defaultDuration;
      
      // Criar um timeout para remover a notificação após a duração
      if (notificationDuration > 0) {
        $timeout(function() {
          this.remove(id);
        }.bind(this), notificationDuration);
      }
      
      return id;
    },
    
    /**
     * Remove uma notificação pelo ID
     * @param {number} id - ID da notificação
     */
    remove: function(id) {
      for (var i = 0; i < notifications.length; i++) {
        if (notifications[i].id === id) {
          notifications.splice(i, 1);
          break;
        }
      }
    },
    
    /**
     * Remove todas as notificações
     */
    clear: function() {
      notifications.length = 0;
    },
    
    /**
     * Exibe uma notificação de sucesso
     * @param {string} message - Mensagem de sucesso
     * @param {number} [duration] - Duração opcional em ms
     */
    success: function(message, duration) {
      return this.add('success', message, duration);
    },
    
    /**
     * Exibe uma notificação de erro
     * @param {string} message - Mensagem de erro
     * @param {number} [duration] - Duração opcional em ms
     */
    error: function(message, duration) {
      return this.add('error', message, duration);
    },
    
    /**
     * Exibe uma notificação de alerta
     * @param {string} message - Mensagem de alerta
     * @param {number} [duration] - Duração opcional em ms
     */
    warning: function(message, duration) {
      return this.add('warning', message, duration);
    },
    
    /**
     * Exibe uma notificação informativa
     * @param {string} message - Mensagem informativa
     * @param {number} [duration] - Duração opcional em ms
     */
    info: function(message, duration) {
      return this.add('info', message, duration);
    },
    
    /**
     * Recupera todas as notificações ativas
     * @returns {Array} Array de notificações
     */
    getAll: function() {
      return notifications;
    }
  };
}]); 