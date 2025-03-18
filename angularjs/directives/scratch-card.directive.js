/**
 * Diretiva para criar um cartão de raspadinha interativo
 * Uso: <scratch-card game-data="jogo" on-complete="onScratchComplete(result)" image-url="capa.jpg"></scratch-card>
 */
app.directive('scratchCard', function($window, $timeout) {
  return {
    restrict: 'E',
    scope: {
      gameData: '=',
      onComplete: '&',
      onProgress: '&',
      imageUrl: '@',
      customColors: '=?',
      scratchPercentage: '@',
      autoReveal: '=?',
      size: '@',
      difficulty: '@',
      scratchable: '=?'
    },
    template: `
      <div class="relative scratch-container animate-fade-in"
           ng-class="{
             'h-48 w-64': size === 'sm',
             'h-64 w-96': !size || size === 'md',
             'h-80 w-112': size === 'lg',
             'h-96 w-128': size === 'xl',
             'opacity-50 cursor-not-allowed': !scratchable
           }">
        
        <!-- Contêiner do Canvas -->
        <div class="scratch-area w-full h-full rounded-lg overflow-hidden">
          <!-- Canvas para raspar -->
          <canvas id="{{canvasId}}" 
                  class="absolute top-0 left-0 z-20 cursor-grab active:cursor-grabbing" 
                  ng-class="{'pointer-events-none': !scratchable || isComplete}" 
                  width="500" height="300">
          </canvas>
          
          <!-- Conteúdo revelado -->
          <div class="scratch-content absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-800 p-4">
            <!-- Resultado de prêmio -->
            <div ng-if="gameData.result.isWin" class="win-indicator animate-pulse p-4 rounded-lg text-center">
              <div class="text-2xl font-bold mb-1">Você Ganhou!</div>
              <div class="text-3xl font-extrabold">R$ {{gameData.result.prize.toFixed(2)}}</div>
              <div class="mt-2 text-sm">{{getWinMessage()}}</div>
            </div>
            
            <!-- Resultado de perda -->
            <div ng-if="!gameData.result.isWin" class="loss-indicator p-4 rounded-lg text-center">
              <div class="text-xl font-bold mb-1">Não foi dessa vez!</div>
              <div class="text-sm mt-2">{{getLossMessage()}}</div>
            </div>
          </div>
        </div>
        
        <!-- Contador de área raspada -->
        <div ng-if="showProgress && !isComplete" class="absolute bottom-2 left-2 z-30 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-xs text-white">
          {{progressPercentage.toFixed(0)}}%
        </div>
        
        <!-- Botão de revelação automática (para depuração ou acessibilidade) -->
        <button 
          ng-if="!isComplete && showAutoRevealButton && scratchable" 
          ng-click="revealAll()" 
          class="absolute top-2 right-2 z-30 bg-gray-900 bg-opacity-60 hover:bg-opacity-80 p-1 rounded-full text-white focus:outline-none transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M3 10a7 7 0 1014 0 7 7 0 00-14 0zm7-8a8 8 0 100 16 8 8 0 000-16z" clip-rule="evenodd" />
          </svg>
        </button>
        
        <!-- Texto de instrução -->
        <div ng-if="!isComplete && !hasStartedScratching && scratchable" class="absolute inset-0 z-40 flex items-center justify-center animate-pulse">
          <div class="bg-gray-900 bg-opacity-75 px-4 py-2 rounded-lg text-white text-center text-sm">
            Arraste para raspar<br>e revelar seu prêmio
          </div>
        </div>
        
        <!-- Overlay de completado -->
        <div ng-if="isComplete" class="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
          <div class="text-center">
            <div ng-if="gameData.result.isWin" class="text-white text-lg font-bold mb-2">Parabéns!</div>
            <button 
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-lg text-white font-medium focus:outline-none transition-colors duration-200"
              ng-click="onPlayAgain()">
              Jogar Novamente
            </button>
          </div>
        </div>
      </div>
    `,
    link: function(scope, element, attrs) {
      // Gerar ID único para o canvas
      scope.canvasId = 'scratch-canvas-' + Math.floor(Math.random() * 1000000);
      
      // Valores padrão
      scope.customColors = scope.customColors || { overlay: '#2d3748', brush: '#ffffff' };
      scope.scratchPercentage = scope.scratchPercentage || 70;
      scope.autoReveal = scope.autoReveal !== undefined ? scope.autoReveal : false;
      scope.size = scope.size || 'md';
      scope.difficulty = scope.difficulty || 'medium';
      scope.scratchable = scope.scratchable !== undefined ? scope.scratchable : true;
      scope.showProgress = attrs.showProgress !== undefined;
      scope.showAutoRevealButton = attrs.showAutoRevealButton !== undefined;
      scope.progressPercentage = 0;
      scope.isComplete = false;
      scope.hasStartedScratching = false;
      
      var canvas, ctx;
      var isDrawing = false;
      var lastPoint;
      var scratchedPixels = 0;
      var totalPixels = 0;
      var image = new Image();
      var brushSize;
      
      // Definir tamanho do pincel com base na dificuldade
      function setBrushSize() {
        var sizeMap = {
          'easy': 40,
          'medium': 30,
          'hard': 20,
          'expert': 10
        };
        brushSize = sizeMap[scope.difficulty] || 30;
      }
      
      // Inicializar o canvas
      function initCanvas() {
        canvas = document.getElementById(scope.canvasId);
        if (!canvas) return;
        
        ctx = canvas.getContext('2d');
        
        // Obter o tamanho do container
        var container = element[0].querySelector('.scratch-area');
        var rect = container.getBoundingClientRect();
        
        // Ajustar o tamanho do canvas ao container
        canvas.width = rect.width;
        canvas.height = rect.height;
        totalPixels = canvas.width * canvas.height;
        
        // Configurar o brush
        setBrushSize();
        
        // Se temos uma imagem, carregar a imagem de overlay
        if (scope.imageUrl) {
          image.onload = function() {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          };
          image.src = scope.imageUrl;
          image.onerror = function() {
            // Fallback para cor sólida se a imagem falhar
            fillCanvas(scope.customColors.overlay);
          };
        } else {
          // Preencher com uma cor sólida
          fillCanvas(scope.customColors.overlay);
        }
        
        // Configurar todos os eventos
        setupEvents();
        
        // Revelar automaticamente se configurado
        if (scope.autoReveal) {
          $timeout(function() {
            revealAll(true);
          }, 500);
        }
      }
      
      // Preencher o canvas com uma cor
      function fillCanvas(color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      
      // Configurar eventos de mouse/touch
      function setupEvents() {
        canvas.addEventListener('mousedown', handleStart);
        canvas.addEventListener('touchstart', handleStart);
        
        canvas.addEventListener('mousemove', handleMove);
        canvas.addEventListener('touchmove', handleMove);
        
        canvas.addEventListener('mouseup', handleEnd);
        canvas.addEventListener('touchend', handleEnd);
        canvas.addEventListener('touchcancel', handleEnd);
        
        // Evitar comportamento de rolagem durante o scratch
        canvas.addEventListener('touchmove', function(e) {
          if (isDrawing) {
            e.preventDefault();
          }
        }, { passive: false });
      }
      
      // Manipulador para início de scratch
      function handleStart(e) {
        if (!scope.scratchable || scope.isComplete) return;
        
        isDrawing = true;
        scope.hasStartedScratching = true;
        
        // Evitar rolagem durante o scratch em dispositivos móveis
        if (e.type === 'touchstart') {
          e.preventDefault();
        }
        
        var point = getEventPoint(e);
        lastPoint = point;
        
        // Desenhar o primeiro ponto
        ctx.globalCompositeOperation = 'destination-out';
        drawPoint(point);
        
        // Atualizar o scope fora do ciclo do Angular
        scope.$apply();
      }
      
      // Manipulador para movimento durante scratch
      function handleMove(e) {
        if (!isDrawing || !scope.scratchable || scope.isComplete) return;
        
        var point = getEventPoint(e);
        
        // Desenhar uma linha entre o último ponto e o atual
        ctx.globalCompositeOperation = 'destination-out';
        drawLine(lastPoint, point);
        
        // Atualizar o último ponto
        lastPoint = point;
        
        // Verificar a porcentagem completa periodicamente (não em cada movimento para performance)
        if (Math.random() < 0.05) {
          checkScratchPercentage();
        }
      }
      
      // Manipulador para fim de scratch
      function handleEnd() {
        if (!isDrawing) return;
        isDrawing = false;
        
        // Verificar a porcentagem completa ao terminar um movimento
        checkScratchPercentage();
      }
      
      // Obter as coordenadas do ponto de toque/clique
      function getEventPoint(e) {
        var rect = canvas.getBoundingClientRect();
        var point = { x: 0, y: 0 };
        
        if (e.type.startsWith('touch')) {
          var touch = e.touches[0] || e.changedTouches[0];
          point.x = touch.clientX - rect.left;
          point.y = touch.clientY - rect.top;
        } else {
          point.x = e.clientX - rect.left;
          point.y = e.clientY - rect.top;
        }
        
        return point;
      }
      
      // Desenhar um ponto no canvas
      function drawPoint(point) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, brushSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Desenhar uma linha entre dois pontos
      function drawLine(start, end) {
        ctx.lineWidth = brushSize * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
      
      // Calcular a porcentagem de área raspada
      function checkScratchPercentage() {
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixelData = imageData.data;
        scratchedPixels = 0;
        
        // Contar pixels transparentes (raspados)
        for (var i = 3; i < pixelData.length; i += 4) {
          if (pixelData[i] === 0) {
            scratchedPixels++;
          }
        }
        
        var percentage = (scratchedPixels / totalPixels) * 100;
        
        // Atualizar o scope fora do ciclo do Angular
        scope.$apply(function() {
          scope.progressPercentage = percentage;
          
          // Chamar callback de progresso
          if (scope.onProgress) {
            scope.onProgress({ percentage: percentage });
          }
          
          // Verificar se atingiu a porcentagem necessária
          if (percentage >= parseInt(scope.scratchPercentage, 10) && !scope.isComplete) {
            completeReveal();
          }
        });
      }
      
      // Revelar toda a área
      function revealAll(animate) {
        if (scope.isComplete) return;
        
        if (animate) {
          // Animação de revelação
          var startT = null;
          var duration = 1000;
          
          function reveal(timestamp) {
            if (!startT) startT = timestamp;
            var progress = (timestamp - startT) / duration;
            
            if (progress < 1) {
              // Ampliar gradualmente o tamanho do brush para revelar
              var currentBrush = brushSize * (1 + progress * 10);
              var centerX = canvas.width / 2;
              var centerY = canvas.height / 2;
              
              ctx.globalCompositeOperation = 'destination-out';
              ctx.beginPath();
              ctx.arc(centerX, centerY, currentBrush, 0, Math.PI * 2);
              ctx.fill();
              
              requestAnimationFrame(reveal);
            } else {
              // Limpar completamente no final
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              completeReveal();
            }
          }
          
          requestAnimationFrame(reveal);
        } else {
          // Revelar imediatamente
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          completeReveal();
        }
      }
      
      // Finalizar o processo de revelação
      function completeReveal() {
        if (scope.isComplete) return;
        
        scope.isComplete = true;
        
        // Chamar o callback com o resultado
        if (scope.onComplete) {
          scope.onComplete({ result: scope.gameData.result });
        }
        
        // Se ganhou, disparar confetti quando disponível
        if (scope.gameData.result.isWin && window.confettiHelper) {
          $timeout(function() {
            window.confettiHelper.victory();
          }, 300);
        }
      }
      
      // Mensagens para vitória
      scope.getWinMessage = function() {
        var messages = [
          "Que sorte a sua!",
          "Hoje é seu dia de sorte!",
          "Continue assim!",
          "A sorte sorriu para você!",
          "Parabéns pelo prêmio!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
      };
      
      // Mensagens para derrota
      scope.getLossMessage = function() {
        var messages = [
          "Tente novamente!",
          "A sorte está logo ali!",
          "Quase lá!",
          "O próximo pode ser o premiado!",
          "Não desista!"
        ];
        return messages[Math.floor(Math.random() * messages.length)];
      };
      
      // Manipulador para jogar novamente
      scope.onPlayAgain = function() {
        // Recarregar a página ou emitir um evento para o controller
        scope.$emit('scratch:playAgain', scope.gameData.id);
      };
      
      // Redimensionamento da janela
      function handleResize() {
        if (canvas && ctx) {
          var container = element[0].querySelector('.scratch-area');
          var rect = container.getBoundingClientRect();
          
          // Salvar o estado do canvas
          var tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          var tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(canvas, 0, 0);
          
          // Redimensionar o canvas
          canvas.width = rect.width;
          canvas.height = rect.height;
          totalPixels = canvas.width * canvas.height;
          
          // Restaurar o estado
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
          
          // Se não tiver começado a raspar, reiniciar a imagem
          if (!scope.hasStartedScratching) {
            if (scope.imageUrl && image.complete) {
              ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            } else {
              fillCanvas(scope.customColors.overlay);
            }
          }
        }
      }
      
      // Monitorar redimensionamento da janela
      var debounceTimeout;
      angular.element($window).on('resize', function() {
        if (debounceTimeout) $timeout.cancel(debounceTimeout);
        debounceTimeout = $timeout(handleResize, 250);
      });
      
      // Inicializar após renderização completa
      $timeout(initCanvas, 0);
      
      // Limpeza ao destruir a diretiva
      scope.$on('$destroy', function() {
        angular.element($window).off('resize');
        if (canvas) {
          canvas.removeEventListener('mousedown', handleStart);
          canvas.removeEventListener('touchstart', handleStart);
          canvas.removeEventListener('mousemove', handleMove);
          canvas.removeEventListener('touchmove', handleMove);
          canvas.removeEventListener('mouseup', handleEnd);
          canvas.removeEventListener('touchend', handleEnd);
          canvas.removeEventListener('touchcancel', handleEnd);
        }
      });
    }
  };
}); 