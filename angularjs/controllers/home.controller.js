/**
 * Controlador da Página Inicial
 * Gerencia os dados da tela inicial, incluindo jogos em destaque
 */
angular.module('raspadinhaApp').controller('HomeController', ['$scope', 'GameService', 'NotificationService', 
function($scope, GameService, NotificationService) {
  var vm = this;
  
  // Dados de jogos em destaque
  vm.featuredGames = [];
  vm.isLoading = true;
  
  // Adicionar o ano atual para o rodapé
  $scope.currentYear = new Date().getFullYear();
  
  /**
   * Inicialização do controlador
   */
  function init() {
    loadFeaturedGames();
  }
  
  /**
   * Carrega os jogos em destaque
   */
  function loadFeaturedGames() {
    vm.isLoading = true;
    
    // Parâmetros para busca de jogos em destaque
    var params = {
      featured: true,
      limit: 4
    };
    
    GameService.getGames(params)
      .then(function(response) {
        vm.featuredGames = response.games || [];
      })
      .catch(function(error) {
        // Em caso de erro, usar dados locais para demonstração
        vm.featuredGames = getFallbackGames();
        NotificationService.warning('Não foi possível carregar os jogos em destaque. Mostrando jogos de demonstração.');
      })
      .finally(function() {
        vm.isLoading = false;
      });
  }
  
  /**
   * Retorna jogos de demonstração para uso quando a API falhar
   * @returns {Array} Array de jogos para fallback
   */
  function getFallbackGames() {
    return [
      {
        id: 1,
        name: "Mega Prêmio",
        description: "Raspadinha com prêmios de até R$ 50.000! Tente sua sorte e ganhe instantaneamente.",
        price: 5.00,
        imageUrl: "assets/img/game-placeholder.jpg"
      },
      {
        id: 2,
        name: "Tesouro Dourado",
        description: "Descubra os tesouros escondidos nesta raspadinha especial com prêmios em ouro.",
        price: 3.00,
        imageUrl: "assets/img/game-placeholder.jpg"
      },
      {
        id: 3,
        name: "Sorte Grande",
        description: "Maiores probabilidades de ganhar! Uma em cada três raspadinhas é premiada.",
        price: 2.00,
        imageUrl: "assets/img/game-placeholder.jpg"
      },
      {
        id: 4,
        name: "Loteria Instantânea",
        description: "Como na loteria, mas com resultado na hora! Prêmios acumulados toda semana.",
        price: 4.50,
        imageUrl: "assets/img/game-placeholder.jpg"
      }
    ];
  }
  
  // Inicializar controlador
  init();
}]); 