// Diretiva para toggle switch personalizado
app.directive('toggleSwitch', function() {
  return {
    restrict: 'E',
    scope: {
      isOn: '=',
      onChange: '&',
      disabled: '=?',
      size: '@',
      label: '@',
      labelPosition: '@',
      color: '@'
    },
    template: `
      <div class="flex items-center cursor-pointer" 
           ng-class="{
             'justify-end': labelPosition === 'left', 
             'opacity-60 cursor-not-allowed': disabled
           }"
           ng-click="toggleSwitch()">
           
        <span ng-if="label && labelPosition !== 'right'" 
              class="mr-2 font-medium text-gray-200" 
              ng-class="{'text-sm': size === 'sm', 'text-base': !size || size === 'md', 'text-lg': size === 'lg'}">
          {{label}}
        </span>
        
        <div class="relative inline-block" ng-class="{
          'w-8 h-4': size === 'sm',
          'w-10 h-5': !size || size === 'md',
          'w-12 h-6': size === 'lg'
        }">
          <div class="block rounded-full transition-colors duration-300" 
               ng-class="{
                 'bg-primary-600': isOn && (!color || color === 'primary'),
                 'bg-green-600': isOn && color === 'success',
                 'bg-red-600': isOn && color === 'danger',
                 'bg-yellow-500': isOn && color === 'warning',
                 'bg-gray-300': !isOn,
                 'h-4': size === 'sm',
                 'h-5': !size || size === 'md',
                 'h-6': size === 'lg',
                 'w-8': size === 'sm',
                 'w-10': !size || size === 'md',
                 'w-12': size === 'lg'
               }">
          </div>
          <div class="dot absolute left-0 top-0 bg-white rounded-full shadow transition duration-300 transform"
               ng-class="{
                 'translate-x-4': isOn && size === 'sm',
                 'translate-x-5': isOn && (!size || size === 'md'),
                 'translate-x-6': isOn && size === 'lg',
                 'h-4 w-4': size === 'sm',
                 'h-5 w-5': !size || size === 'md',
                 'h-6 w-6': size === 'lg',
                 'ring-2 ring-primary-500': isOn && (!color || color === 'primary') && !disabled,
                 'ring-2 ring-green-500': isOn && color === 'success' && !disabled,
                 'ring-2 ring-red-500': isOn && color === 'danger' && !disabled,
                 'ring-2 ring-yellow-400': isOn && color === 'warning' && !disabled
               }">
          </div>
        </div>
        
        <span ng-if="label && labelPosition === 'right'" 
              class="ml-2 font-medium text-gray-200" 
              ng-class="{'text-sm': size === 'sm', 'text-base': !size || size === 'md', 'text-lg': size === 'lg'}">
          {{label}}
        </span>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Valores padrão
      scope.size = scope.size || 'md';
      scope.labelPosition = scope.labelPosition || 'right';
      scope.color = scope.color || 'primary';
      scope.disabled = scope.disabled || false;
      
      // Função para alternar o estado
      scope.toggleSwitch = function() {
        if (scope.disabled) return;
        
        scope.isOn = !scope.isOn;
        
        if (scope.onChange) {
          scope.$applyAsync(function() {
            scope.onChange({value: scope.isOn});
          });
        }
      };
    }
  };
}); 