/**
 * Diretiva para exibir um indicador de carregamento personalizado
 * Uso: <loading-spinner show="isLoading" size="md" text="Carregando..." type="circle"></loading-spinner>
 */
app.directive('loadingSpinner', function() {
  return {
    restrict: 'E',
    scope: {
      show: '=',
      size: '@',
      text: '@',
      type: '@',
      fullScreen: '=?',
      color: '@'
    },
    template: `
      <div ng-if="show" 
           class="flex items-center justify-center animate-fade-in"
           ng-class="{'fixed inset-0 z-50 bg-gray-900 bg-opacity-50 backdrop-blur-sm': fullScreen}">
        <!-- Spinner Circular -->
        <div ng-if="!type || type === 'circle'" class="flex flex-col items-center justify-center space-y-2">
          <svg 
            ng-class="getSizeClass()"
            class="animate-spin" 
            viewBox="0 0 24 24"
            fill="none">
            <circle 
              class="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              stroke-width="4"></circle>
            <path 
              class="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          <span 
            ng-if="text" 
            class="text-sm font-medium"
            ng-class="getColorClass()">
            {{text}}
          </span>
        </div>
        
        <!-- Spinner de Pulso -->
        <div ng-if="type === 'pulse'" class="flex flex-col items-center justify-center space-y-2">
          <div class="flex space-x-1">
            <div ng-class="[getSizeClass('pulse'), getColorClass(), 'animate-pulse rounded-full']"></div>
            <div ng-class="[getSizeClass('pulse'), getColorClass(), 'animate-pulse rounded-full animation-delay-200']"></div>
            <div ng-class="[getSizeClass('pulse'), getColorClass(), 'animate-pulse rounded-full animation-delay-400']"></div>
          </div>
          <span 
            ng-if="text" 
            class="text-sm font-medium"
            ng-class="getColorClass()">
            {{text}}
          </span>
        </div>
        
        <!-- Spinner de Progresso -->
        <div ng-if="type === 'bar'" class="flex flex-col items-center justify-center space-y-2">
          <div 
            ng-class="{'w-36': size === 'sm', 'w-48': !size || size === 'md', 'w-64': size === 'lg', 'w-80': size === 'xl'}" 
            class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full bar-progress-animate" ng-class="getColorClass()"></div>
          </div>
          <span 
            ng-if="text" 
            class="text-sm font-medium"
            ng-class="getColorClass()">
            {{text}}
          </span>
        </div>
        
        <!-- Spinner de Cartões -->
        <div ng-if="type === 'cards'" class="flex flex-col items-center justify-center space-y-2">
          <div class="flex space-x-1 items-center">
            <div ng-class="[getSizeClass('card'), getColorClass(), 'card-animate-1']"></div>
            <div ng-class="[getSizeClass('card'), getColorClass(), 'card-animate-2']"></div>
            <div ng-class="[getSizeClass('card'), getColorClass(), 'card-animate-3']"></div>
            <div ng-class="[getSizeClass('card'), getColorClass(), 'card-animate-4']"></div>
          </div>
          <span 
            ng-if="text" 
            class="text-sm font-medium"
            ng-class="getColorClass()">
            {{text}}
          </span>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Definir valores padrão
      scope.size = scope.size || 'md';
      scope.type = scope.type || 'circle';
      scope.fullScreen = scope.fullScreen !== undefined ? scope.fullScreen : false;
      scope.color = scope.color || 'primary';
      
      // Obter classes de tamanho baseado no tipo
      scope.getSizeClass = function(spinnerType) {
        if (spinnerType === 'pulse') {
          return {
            'h-2 w-2': scope.size === 'sm',
            'h-3 w-3': !scope.size || scope.size === 'md',
            'h-4 w-4': scope.size === 'lg',
            'h-5 w-5': scope.size === 'xl'
          };
        } else if (spinnerType === 'card') {
          return {
            'h-4 w-2': scope.size === 'sm',
            'h-6 w-3': !scope.size || scope.size === 'md',
            'h-8 w-4': scope.size === 'lg',
            'h-10 w-5': scope.size === 'xl'
          };
        } else {
          return {
            'h-5 w-5': scope.size === 'sm',
            'h-8 w-8': !scope.size || scope.size === 'md',
            'h-12 w-12': scope.size === 'lg',
            'h-16 w-16': scope.size === 'xl'
          };
        }
      };
      
      // Obter classe de cor
      scope.getColorClass = function() {
        var colorMap = {
          'primary': 'text-primary-500 bg-primary-500',
          'success': 'text-green-500 bg-green-500',
          'error': 'text-red-500 bg-red-500',
          'warning': 'text-yellow-500 bg-yellow-500',
          'info': 'text-blue-500 bg-blue-500',
          'light': 'text-gray-300 bg-gray-300',
          'dark': 'text-gray-700 bg-gray-700'
        };
        
        return colorMap[scope.color] || colorMap.primary;
      };
      
      // Adicionar estilos necessários para as animações
      var styleElement = angular.element(document.createElement('style'));
      styleElement.text(`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .bar-progress-animate {
          width: 30%;
          animation: progress-bar 1.5s ease-in-out infinite;
        }
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        .card-animate-1, .card-animate-2, .card-animate-3, .card-animate-4 {
          border-radius: 0.25rem;
          animation: card-loading 1.5s ease-in-out infinite;
        }
        .card-animate-2 {
          animation-delay: 0.2s;
        }
        .card-animate-3 {
          animation-delay: 0.4s;
        }
        .card-animate-4 {
          animation-delay: 0.6s;
        }
        @keyframes card-loading {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `);
      
      // Adicionar estilos ao cabeçalho
      angular.element(document.head).append(styleElement);
      
      // Remover estilos quando a diretiva for destruída
      element.on('$destroy', function() {
        styleElement.remove();
      });
    }
  };
}); 