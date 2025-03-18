/**
 * Diretiva para exibir um card de jogo de raspadinha
 * Uso: <game-card game="jogo" on-play="playGame(gameId)" size="md"></game-card>
 */
app.directive('gameCard', function() {
  return {
    restrict: 'E',
    scope: {
      game: '=',
      onPlay: '&',
      size: '@',
      showDetails: '=?',
      horizontal: '=?'
    },
    templateUrl: 'directives/templates/game-card.html',
    link: function(scope, element, attrs) {
      // Valores padrão
      scope.size = scope.size || 'md';
      scope.showDetails = scope.showDetails !== undefined ? scope.showDetails : true;
      scope.horizontal = scope.horizontal !== undefined ? scope.horizontal : false;
      
      // Formatadores auxiliares
      scope.formatPrice = function(price) {
        if (typeof price !== 'number') return '0,00';
        return price.toFixed(2).replace('.', ',');
      };
      
      scope.formatProbability = function(probability) {
        if (typeof probability !== 'number') return '0,0';
        return (probability * 100).toFixed(1).replace('.', ',');
      };
      
      scope.getProbabilityWidth = function(probability) {
        if (typeof probability !== 'number') return '0%';
        return (probability * 100) + '%';
      };
      
      // Inicializar jogo com valores padrão se não estiverem presentes
      if (scope.game) {
        scope.game.winProbability = scope.game.winProbability || 0.25;
        scope.game.totalPlays = scope.game.totalPlays || 0;
        scope.game.totalPrizesPaid = scope.game.totalPrizesPaid || 0;
        scope.game.maxPrize = scope.game.maxPrize || 0;
        scope.game.price = scope.game.price || 0;
        
        // Se houver desconto, calcular o preço original
        if (scope.game.discountPercentage > 0 && !scope.game.originalPrice) {
          scope.game.originalPrice = parseFloat((scope.game.price / (1 - scope.game.discountPercentage / 100)).toFixed(2));
        }
      }
      
      // Função para jogar o jogo
      scope.play = function() {
        if (scope.onPlay) {
          scope.onPlay({ gameId: scope.game.id });
        }
      };
    }
  };
}); 