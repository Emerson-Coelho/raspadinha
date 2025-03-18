/**
 * Diretiva de Notificações
 * Exibe mensagens de notificação na interface
 */
angular.module('raspadinhaApp').directive('notifications', ['$timeout', 
function($timeout) {
  return {
    restrict: 'E',
    template: `
      <div class="fixed top-5 right-5 z-50 w-80 space-y-3">
        <div ng-repeat="notification in notifications"
             ng-class="{
               'bg-green-600': notification.type === 'success',
               'bg-red-600': notification.type === 'error',
               'bg-yellow-600': notification.type === 'warning',
               'bg-blue-600': notification.type === 'info'
             }"
             class="px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300"
             ng-style="{ 
               opacity: notification.show ? 1 : 0,
               transform: notification.show ? 'translateX(0)' : 'translateX(100%)'
             }">
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <!-- Ícone baseado no tipo -->
              <svg ng-if="notification.type === 'success'" class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <svg ng-if="notification.type === 'error'" class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              <svg ng-if="notification.type === 'warning'" class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <svg ng-if="notification.type === 'info'" class="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span class="text-white">{{ notification.message }}</span>
            </div>
            <button class="text-white hover:text-gray-200 focus:outline-none" ng-click="removeNotification(notification.id)">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `,
    link: function(scope) {
      // Método para remover uma notificação específica
      scope.removeNotification = function(id) {
        for (var i = 0; i < scope.notifications.length; i++) {
          if (scope.notifications[i].id === id) {
            // Primeiro esconde a notificação com uma animação
            scope.notifications[i].show = false;
            
            // Depois remove a notificação do array após a animação terminar
            (function(index) {
              $timeout(function() {
                scope.notifications.splice(index, 1);
              }, 300);
            })(i);
            
            break;
          }
        }
      };
    }
  };
}]);

/**
 * Serviço para gerenciar notificações
 */
app.service('NotificationService', ['$timeout', function($timeout) {
  var notifications = [];
  var nextId = 1;
  
  // Tipos de notificação válidos
  var validTypes = ['success', 'error', 'info', 'warning'];
  
  // Adicionar nova notificação
  function addNotification(notification) {
    // Validar tipo
    if (!notification.type || validTypes.indexOf(notification.type) === -1) {
      notification.type = 'info';
    }
    
    // Definir duração padrão se não for especificada
    if (notification.duration === undefined) {
      // Duração padrão baseada no tipo
      var durationMap = {
        'success': 5000,
        'info': 6000,
        'warning': 7000,
        'error': 8000
      };
      notification.duration = durationMap[notification.type];
    }
    
    // Atribuir ID único
    notification.id = nextId++;
    
    // Adicionar timestamp
    notification.timestamp = new Date().getTime();
    
    // Adicionar à lista
    notifications.push(notification);
    
    // Configurar auto-remoção após o tempo definido
    if (notification.duration > 0) {
      $timeout(function() {
        removeNotification(notification.id);
      }, notification.duration);
    }
    
    // Limitar o número de notificações simultâneas
    if (notifications.length > 5) {
      // Remover a notificação mais antiga
      notifications.shift();
    }
    
    return notification.id;
  }
  
  // Remover notificação por ID
  function removeNotification(id) {
    for (var i = 0; i < notifications.length; i++) {
      if (notifications[i].id === id) {
        notifications.splice(i, 1);
        return true;
      }
    }
    return false;
  }
  
  // Limpar todas as notificações
  function clearNotifications() {
    notifications = [];
  }
  
  // Atalhos para diferentes tipos de notificação
  function success(message, title, options) {
    return addNotification(createNotificationObject('success', message, title, options));
  }
  
  function error(message, title, options) {
    return addNotification(createNotificationObject('error', message, title, options));
  }
  
  function info(message, title, options) {
    return addNotification(createNotificationObject('info', message, title, options));
  }
  
  function warning(message, title, options) {
    return addNotification(createNotificationObject('warning', message, title, options));
  }
  
  // Criar objeto de notificação
  function createNotificationObject(type, message, title, options) {
    options = options || {};
    
    return {
      type: type,
      message: message,
      title: title,
      duration: options.duration,
      detail: options.detail,
      actionLabel: options.actionLabel,
      actionCallback: options.actionCallback
    };
  }
  
  // Obter todas as notificações
  function getNotifications() {
    return notifications;
  }
  
  // API pública
  return {
    addNotification: addNotification,
    removeNotification: removeNotification,
    clearNotifications: clearNotifications,
    getNotifications: getNotifications,
    success: success,
    error: error,
    info: info,
    warning: warning
  };
}]); 