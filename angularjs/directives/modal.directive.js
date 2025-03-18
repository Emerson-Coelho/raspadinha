/**
 * Diretiva para criar modais na aplicação
 * Uso: <modal show="mostrarModal" title="Título do Modal" size="md" on-close="fecharModal()">
 *        Conteúdo do modal aqui
 *      </modal>
 */
app.directive('modal', function($document, $timeout) {
  return {
    restrict: 'E',
    transclude: true,
    scope: {
      show: '=',
      title: '@',
      onClose: '&',
      size: '@',
      showCloseButton: '=?',
      fullScreen: '=?',
      showFooter: '=?',
      cancelText: '@',
      confirmText: '@',
      onConfirm: '&'
    },
    template: `
      <div 
        class="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-gray-900 bg-opacity-70 backdrop-blur-sm transition-opacity duration-300"
        ng-class="{'opacity-0 pointer-events-none': !show, 'opacity-100': show}"
        ng-click="backdropClick($event)">
        
        <div 
          class="relative bg-gray-800 rounded-lg shadow-xl m-4 animate-fade-in"
          ng-class="{
            'w-full max-w-sm': size === 'sm',
            'w-full max-w-md': !size || size === 'md',
            'w-full max-w-lg': size === 'lg',
            'w-full max-w-xl': size === 'xl',
            'w-full max-w-2xl': size === '2xl',
            'w-full max-w-4xl': size === '3xl',
            'w-full max-w-7xl': size === '4xl',
            'w-full h-full': fullScreen,
            'transition-transform duration-300 transform': true,
            'scale-95': !show && !fullScreen,
            'scale-100': show && !fullScreen
          }">
          
          <!-- Cabeçalho do Modal -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h3 class="text-lg font-medium text-white">{{title}}</h3>
            <button 
              ng-if="showCloseButton !== false"
              class="text-gray-400 hover:text-gray-100 focus:outline-none transition-colors"
              ng-click="close()">
              <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <!-- Conteúdo do Modal -->
          <div class="p-6 overflow-auto" ng-class="{'max-h-[calc(100vh-12rem)]': !fullScreen, 'max-h-[calc(100vh-8rem)]': fullScreen}">
            <div ng-transclude></div>
          </div>
          
          <!-- Rodapé do Modal -->
          <div ng-if="showFooter" class="px-6 py-4 border-t border-gray-700 flex justify-end space-x-3">
            <button 
              ng-if="cancelText"
              class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded focus:outline-none transition-colors"
              ng-click="close()">
              {{cancelText || 'Cancelar'}}
            </button>
            <button 
              ng-if="confirmText"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded focus:outline-none transition-colors"
              ng-click="confirm()">
              {{confirmText || 'Confirmar'}}
            </button>
          </div>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Valores padrão
      scope.showCloseButton = scope.showCloseButton !== undefined ? scope.showCloseButton : true;
      scope.fullScreen = scope.fullScreen !== undefined ? scope.fullScreen : false;
      scope.showFooter = scope.showFooter !== undefined ? scope.showFooter : !!scope.confirmText;
      
      // Fechar modal
      scope.close = function() {
        scope.show = false;
        if (scope.onClose) {
          $timeout(scope.onClose);
        }
      };
      
      // Confirmar ação
      scope.confirm = function() {
        if (scope.onConfirm) {
          $timeout(scope.onConfirm);
        }
        scope.close();
      };
      
      // Fechar ao clicar no backdrop
      scope.backdropClick = function(event) {
        if (event.target === event.currentTarget) {
          scope.close();
        }
      };
      
      // Listeners do teclado
      function handleKeyDown(e) {
        if (scope.show && e.keyCode === 27) { // ESC
          scope.$apply(function() {
            scope.close();
          });
        }
      }
      
      // Controlar overflow do body quando o modal estiver aberto
      scope.$watch('show', function(newVal) {
        if (newVal) {
          document.body.classList.add('overflow-hidden');
        } else {
          document.body.classList.remove('overflow-hidden');
        }
      });
      
      // Adicionar/remover listener de teclado
      $document.on('keydown', handleKeyDown);
      
      // Limpeza ao destruir
      scope.$on('$destroy', function() {
        $document.off('keydown', handleKeyDown);
        document.body.classList.remove('overflow-hidden');
      });
    }
  };
}); 