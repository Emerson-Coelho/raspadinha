// Diretiva para exibição de avatar de usuário
app.directive('userAvatar', function() {
  return {
    restrict: 'E',
    scope: {
      user: '=',
      size: '@',
      showStatus: '=?',
      showBadge: '=?',
      badgeType: '@',
      statusType: '@'
    },
    template: `
      <div class="relative inline-block">
        <!-- Avatar -->
        <div 
          class="overflow-hidden flex items-center justify-center rounded-full bg-gray-700"
          ng-class="{
            'h-8 w-8': size === 'sm',
            'h-10 w-10': !size || size === 'md',
            'h-12 w-12': size === 'lg',
            'h-16 w-16': size === 'xl',
            'border-2 border-primary-500': user.isCurrentUser
          }">
          
          <!-- Imagem do usuário se disponível -->
          <img 
            ng-if="user.profileImage" 
            ng-src="{{user.profileImage}}" 
            alt="{{user.fullName || user.username || 'Usuário'}}"
            class="h-full w-full object-cover"
            onError="this.style.display='none'">
          
          <!-- Iniciais do usuário como fallback -->
          <span 
            ng-if="!user.profileImage || imageError" 
            class="font-medium text-gray-200"
            ng-class="{
              'text-xs': size === 'sm',
              'text-sm': !size || size === 'md',
              'text-base': size === 'lg',
              'text-lg': size === 'xl'
            }">
            {{getInitials()}}
          </span>
        </div>
        
        <!-- Indicador de status -->
        <span 
          ng-if="showStatus && statusType" 
          class="absolute bottom-0 right-0 rounded-full ring-2 ring-gray-800"
          ng-class="{
            'h-2 w-2': size === 'sm',
            'h-3 w-3': !size || size === 'md',
            'h-3 w-3': size === 'lg',
            'h-4 w-4': size === 'xl',
            'bg-green-500': statusType === 'online',
            'bg-yellow-500': statusType === 'away',
            'bg-red-500': statusType === 'offline',
            'bg-gray-500': statusType === 'inactive' || !statusType
          }">
        </span>
        
        <!-- Badge -->
        <div 
          ng-if="showBadge && badgeType" 
          class="absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-primary-500 text-white"
          ng-class="{
            'h-4 w-4 text-xs': size === 'sm',
            'h-5 w-5 text-xs': !size || size === 'md',
            'h-6 w-6 text-sm': size === 'lg',
            'h-7 w-7 text-sm': size === 'xl',
            'bg-primary-500': !badgeType || badgeType === 'default',
            'bg-green-500': badgeType === 'success',
            'bg-red-500': badgeType === 'error',
            'bg-yellow-500': badgeType === 'warning',
            'bg-blue-500': badgeType === 'info',
            'bg-purple-500': badgeType === 'premium'
          }">
          <span ng-if="badgeType === 'premium'">⭐</span>
          <span ng-if="badgeType === 'admin'">A</span>
          <span ng-if="badgeType === 'notifications'">{{getBadgeCount()}}</span>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Valores padrão
      scope.size = scope.size || 'md';
      scope.showStatus = scope.showStatus !== undefined ? scope.showStatus : false;
      scope.showBadge = scope.showBadge !== undefined ? scope.showBadge : false;
      scope.imageError = false;
      
      // Detectar erro na imagem
      element.find('img').on('error', function() {
        scope.$apply(function() {
          scope.imageError = true;
        });
      });
      
      // Obter iniciais do nome do usuário
      scope.getInitials = function() {
        const fullName = scope.user.fullName || scope.user.username || 'Usuário';
        return fullName
          .split(' ')
          .map(name => name.charAt(0))
          .slice(0, 2)
          .join('')
          .toUpperCase();
      };
      
      // Obter contagem para o badge
      scope.getBadgeCount = function() {
        if (scope.badgeType === 'notifications' && scope.user.notifications) {
          const count = scope.user.notifications.unreadCount || 0;
          return count > 9 ? '9+' : count;
        }
        return '';
      };
    }
  };
}); 