
// Controller de detalhes do jogo
app.controller('GameDetailController', ['$scope', '$state', '$stateParams', 'GameService', 'AuthService',
  function($scope, $state, $stateParams, GameService, AuthService) {
    const vm = this;
    
    // Propriedades
    vm.game = null;
    vm.gameResult = null;
    vm.isLoading = true;
    vm.error = null;
    vm.isPlaying = false;
    vm.isAuthenticated = AuthService.isLoggedIn();
    vm.showLoginModal = false;
    
    // Propriedades do resultado
    vm.hasWon = false;
    vm.prize = null;
    vm.scratchComplete = false;
    
    // Métodos públicos
    vm.playGame = playGame;
    vm.goToLogin = goToLogin;
    vm.scratch = scratch;
    vm.onScratchComplete = onScratchComplete;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      vm.isLoading = true;
      
      // Obter ID do jogo dos parâmetros da rota
      const gameId = $stateParams.id;
      
      if (!gameId) {
        vm.error = 'ID do jogo não especificado.';
        vm.isLoading = false;
        return;
      }
      
      GameService.getGameById(gameId)
        .then(function(response) {
          vm.game = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar detalhes do jogo: ' + error.message;
          vm.isLoading = false;
          console.error('Erro ao carregar detalhes do jogo:', error);
        });
    }
    
    function playGame() {
      // Verificar se o usuário está autenticado
      if (!vm.isAuthenticated) {
        vm.showLoginModal = true;
        return;
      }
      
      vm.isLoading = true;
      vm.isPlaying = true;
      
      GameService.playGame(vm.game.id)
        .then(function(response) {
          vm.gameResult = response;
          vm.hasWon = response.hasWon;
          vm.prize = response.prize;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = error.data && error.data.message ? 
                    error.data.message : 
                    'Erro ao jogar. Tente novamente.';
          vm.isPlaying = false;
          vm.isLoading = false;
          console.error('Erro ao jogar:', error);
        });
    }
    
    function goToLogin() {
      vm.showLoginModal = false;
      $state.go('login');
    }
    
    function scratch() {
      // Função chamada quando o usuário começa a raspar a raspadinha
      console.log('Começou a raspar a raspadinha');
    }
    
    function onScratchComplete() {
      // Função chamada quando o usuário termina de raspar a raspadinha
      vm.scratchComplete = true;
      
      // Se o jogador ganhou, mostrar animação de confete
      if (vm.hasWon) {
        showWinAnimation();
      }
    }
    
    // Função auxiliar para mostrar animação de vitória
    function showWinAnimation() {
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }
]); 