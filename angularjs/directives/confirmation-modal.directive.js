// Diretiva de modal de confirmação
app.directive('confirmationModal', function() {
  return {
    restrict: 'E',
    transclude: {
      'title': '?confirmationTitle',
      'body': '?confirmationBody',
      'footer': '?confirmationFooter'
    },
    scope: {
      isOpen: '=',
      onConfirm: '&',
      onCancel: '&',
      title: '@',
      message: '@',
      confirmText: '@',
      cancelText: '@',
      confirmButtonType: '@',
      size: '@'
    },
    template: `
      <div class="fixed inset-0 z-50 flex items-center justify-center" ng-show="isOpen">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black opacity-50" ng-click="cancel()"></div>
        
        <!-- Modal -->
        <div 
          class="bg-gray-800 rounded-lg shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
          ng-class="{
            'w-full max-w-sm': size === 'sm',
            'w-full max-w-md': !size || size === 'md',
            'w-full max-w-lg': size === 'lg',
            'w-full max-w-2xl': size === 'xl'
          }">
          
          <!-- Cabeçalho -->
          <div class="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h3 class="text-lg font-medium text-white" ng-if="!$transclude.title">{{title || 'Confirmação'}}</h3>
            <div ng-transclude="title" ng-if="$transclude.title"></div>
            
            <button 
              type="button" 
              class="text-gray-400 hover:text-white focus:outline-none" 
              ng-click="cancel()">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
              </svg>
            </button>
          </div>
          
          <!-- Corpo -->
          <div class="p-6 flex-grow overflow-auto">
            <div ng-if="!$transclude.body" class="text-gray-300">
              {{message || 'Tem certeza que deseja continuar com esta ação?'}}
            </div>
            <div ng-transclude="body" ng-if="$transclude.body"></div>
          </div>
          
          <!-- Rodapé -->
          <div class="px-4 py-3 border-t border-gray-700 flex justify-end space-x-2" ng-if="!$transclude.footer">
            <button 
              type="button" 
              class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors" 
              ng-click="cancel()">
              {{cancelText || 'Cancelar'}}
            </button>
            <button 
              type="button" 
              ng-class="{
                'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500': confirmButtonType === 'primary' || !confirmButtonType,
                'bg-red-600 hover:bg-red-700 focus:ring-red-500': confirmButtonType === 'danger',
                'bg-green-600 hover:bg-green-700 focus:ring-green-500': confirmButtonType === 'success',
                'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500': confirmButtonType === 'warning'
              }"
              class="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 transition-colors"
              ng-click="confirm()">
              {{confirmText || 'Confirmar'}}
            </button>
          </div>
          <div ng-transclude="footer" ng-if="$transclude.footer" class="px-4 py-3 border-t border-gray-700"></div>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Valores padrão
      scope.size = scope.size || 'md';
      scope.confirmButtonType = scope.confirmButtonType || 'primary';
      
      // Métodos para confirmação e cancelamento
      scope.confirm = function() {
        if (scope.onConfirm) {
          scope.onConfirm();
        }
        scope.isOpen = false;
      };
      
      scope.cancel = function() {
        if (scope.onCancel) {
          scope.onCancel();
        }
        scope.isOpen = false;
      };
      
      // Fechar o modal com a tecla Escape
      function escapeHandler(e) {
        if (e.keyCode === 27 && scope.isOpen) {
          scope.$apply(function() {
            scope.cancel();
          });
        }
      }
      
      // Adicionar evento de teclado
      document.addEventListener('keydown', escapeHandler);
      
      // Remover evento ao destruir a diretiva
      scope.$on('$destroy', function() {
        document.removeEventListener('keydown', escapeHandler);
      });
    }
  };
}); 