/**
 * Diretiva para exibir o saldo do usuário com animação
 * Uso: <balance-display value="usuario.saldo" change="valorMudanca" currency="BRL" size="md"></balance-display>
 */
app.directive('balanceDisplay', function($timeout, $filter) {
  return {
    restrict: 'E',
    scope: {
      value: '=',
      change: '=?',
      currency: '@',
      size: '@',
      showCurrency: '=?',
      showChange: '=?',
      highlight: '=?',
      loading: '=?'
    },
    template: `
      <div class="relative flex flex-col items-start justify-center">
        <!-- Valor do saldo -->
        <div class="flex items-center" ng-if="!loading">
          <span 
            class="font-semibold"
            ng-class="{
              'text-sm': size === 'sm',
              'text-lg': !size || size === 'md',
              'text-xl': size === 'lg',
              'text-2xl': size === 'xl',
              'text-3xl': size === 'xxl',
              'text-primary-500': highlight && highlightActive,
              'text-green-500': change > 0 && showChange && highlightActive,
              'text-red-500': change < 0 && showChange && highlightActive
            }">
            <span ng-if="showCurrency">{{getCurrencySymbol()}}</span>
            {{formattedValue}}
          </span>
          
          <!-- Indicador de mudança -->
          <span 
            ng-if="showChange && change !== 0 && change !== undefined" 
            class="ml-2 flex items-center font-medium"
            ng-class="{
              'text-xs': size === 'sm',
              'text-sm': !size || size === 'md',
              'text-base': size === 'lg',
              'text-lg': size === 'xl',
              'text-xl': size === 'xxl',
              'text-green-500': change > 0,
              'text-red-500': change < 0
            }">
            <span ng-if="change > 0">+</span>{{formatCurrency(change)}}
            <svg ng-if="change > 0" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>
            <svg ng-if="change < 0" class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </span>
        </div>
        
        <!-- Estado de carregamento -->
        <div 
          ng-if="loading" 
          class="skeleton"
          ng-class="{
            'h-4 w-20': size === 'sm',
            'h-5 w-24': !size || size === 'md',
            'h-6 w-28': size === 'lg',
            'h-7 w-32': size === 'xl',
            'h-8 w-36': size === 'xxl'
          }">
        </div>
        
        <!-- Rótulo de moeda -->
        <div 
          ng-if="showCurrencyName && !loading" 
          class="text-gray-500 mt-1"
          ng-class="{
            'text-xs': size === 'sm' || !size || size === 'md',
            'text-sm': size === 'lg' || size === 'xl',
            'text-base': size === 'xxl'
          }">
          {{getCurrencyName()}}
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Valores padrão
      scope.size = scope.size || 'md';
      scope.currency = scope.currency || 'BRL';
      scope.showCurrency = scope.showCurrency !== undefined ? scope.showCurrency : true;
      scope.showChange = scope.showChange !== undefined ? scope.showChange : false;
      scope.highlight = scope.highlight !== undefined ? scope.highlight : true;
      scope.showCurrencyName = attrs.showCurrencyName !== undefined ? 
        (attrs.showCurrencyName === 'true') : false;
      
      scope.highlightActive = false;
      scope.formattedValue = '0,00';
      scope.previousValue = 0;
      
      // Mapeamento de símbolos de moeda
      var currencySymbols = {
        'BRL': 'R$',
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥'
      };
      
      // Nomes das moedas
      var currencyNames = {
        'BRL': 'Real Brasileiro',
        'USD': 'Dólar Americano',
        'EUR': 'Euro',
        'GBP': 'Libra Esterlina',
        'JPY': 'Iene Japonês'
      };
      
      // Obter o símbolo da moeda
      scope.getCurrencySymbol = function() {
        return currencySymbols[scope.currency] || scope.currency;
      };
      
      // Obter o nome da moeda
      scope.getCurrencyName = function() {
        return currencyNames[scope.currency] || scope.currency;
      };
      
      // Formatar o valor monetário
      scope.formatCurrency = function(value) {
        if (value === undefined || value === null) return '0,00';
        return $filter('currency')(value, '', 2).replace('.', ',');
      };
      
      // Animação de contagem
      function animateCount(from, to, duration) {
        var start = null;
        var initialValue = parseFloat(from);
        var targetValue = parseFloat(to);
        
        if (isNaN(initialValue) || isNaN(targetValue)) {
          scope.formattedValue = scope.formatCurrency(to);
          return;
        }
        
        function step(timestamp) {
          if (!start) start = timestamp;
          var progress = Math.min((timestamp - start) / duration, 1);
          var currentValue = initialValue + progress * (targetValue - initialValue);
          
          scope.$apply(function() {
            scope.formattedValue = scope.formatCurrency(currentValue);
          });
          
          if (progress < 1) {
            window.requestAnimationFrame(step);
          } else {
            scope.$apply(function() {
              scope.formattedValue = scope.formatCurrency(targetValue);
              
              // Desativar o highlight após um período
              if (scope.highlight && scope.change !== 0 && scope.change !== undefined) {
                scope.highlightActive = true;
                $timeout(function() {
                  scope.highlightActive = false;
                }, 1500);
              }
            });
          }
        }
        
        window.requestAnimationFrame(step);
      }
      
      // Observar mudanças no valor
      scope.$watch('value', function(newValue, oldValue) {
        if (newValue !== oldValue && newValue !== undefined) {
          // Armazenar valor anterior para animação
          scope.previousValue = oldValue || 0;
          
          // Definir mudança quando não for explicitamente fornecida
          if (scope.change === undefined && oldValue !== undefined) {
            scope.change = newValue - oldValue;
          }
          
          // Animar a transição
          var duration = Math.min(Math.abs(newValue - scope.previousValue) * 100, 1000);
          animateCount(scope.previousValue, newValue, duration);
        } else if (newValue !== undefined) {
          scope.formattedValue = scope.formatCurrency(newValue);
        }
      });
      
      // Inicialização
      if (scope.value !== undefined) {
        scope.formattedValue = scope.formatCurrency(scope.value);
      }
    }
  };
}); 