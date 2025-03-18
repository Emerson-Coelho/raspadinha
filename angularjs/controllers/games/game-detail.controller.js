// Controller da página de detalhes do jogo
export function GameDetailController($scope, $routeParams, GameService, AuthService) {
  const vm = this;
  
  // Dados do controller
  vm.gameId = $routeParams.gameId;
  vm.game = null;
  vm.isLoading = true;
  vm.error = null;
  vm.playResult = null;
  vm.isAuthenticated = AuthService.isAuthenticated;
  vm.user = AuthService.user;
  vm.isPlaying = false;
  
  // Métodos
  vm.playGame = playGame;
  vm.resetGame = resetGame;
  vm.revealCard = revealCard;
  vm.canPlay = canPlay;
  vm.checkWin = checkWin;
  
  // Propriedades do jogo
  vm.scratchedCells = [];
  vm.revealedCells = 0;
  vm.hasWon = false;
  
  // Inicialização
  initialize();
  
  function initialize() {
    vm.isLoading = true;
    
    // Carregar detalhes do jogo
    GameService.getGameById(vm.gameId)
      .then(game => {
        vm.game = game;
        vm.isLoading = false;
      })
      .catch(error => {
        console.error(`Erro ao carregar jogo ${vm.gameId}:`, error);
        vm.error = 'Ocorreu um erro ao carregar os detalhes do jogo. Por favor, tente novamente.';
        vm.isLoading = false;
      });
  }
  
  function playGame() {
    // Verificar se o usuário está autenticado
    if (!vm.isAuthenticated) {
      window.location.href = '#!/auth/login';
      return;
    }
    
    // Verificar se o usuário pode jogar (saldo, etc)
    if (!canPlay()) {
      vm.error = 'Saldo insuficiente para jogar este jogo.';
      return;
    }
    
    vm.isPlaying = true;
    vm.playResult = null;
    vm.hasWon = false;
    vm.revealedCells = 0;
    vm.scratchedCells = [];
    
    // Fazer a solicitação para jogar
    GameService.playGame(vm.gameId)
      .then(result => {
        vm.playResult = result;
        
        // Configurar a matriz de células para raspar
        if (result.gameBoard) {
          vm.gameBoard = result.gameBoard;
        } else {
          // Criar uma matriz padrão se não for fornecida pelo backend
          const rows = vm.game.rows || 3;
          const cols = vm.game.cols || 3;
          vm.gameBoard = Array(rows).fill().map(() => Array(cols).fill(0));
          
          // Distribuir números aleatoriamente (simulação)
          const symbols = [1, 2, 3, 4, 5, 6, 7];
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
              vm.gameBoard[i][j] = symbols[Math.floor(Math.random() * symbols.length)];
            }
          }
          
          // Se for uma vitória, garantir que haja símbolos correspondentes
          if (result.win) {
            const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            const minMatches = vm.game.minMatchesToWin || 3;
            let matches = 0;
            
            while (matches < minMatches) {
              const i = Math.floor(Math.random() * rows);
              const j = Math.floor(Math.random() * cols);
              vm.gameBoard[i][j] = winSymbol;
              matches++;
            }
          }
        }
        
        // Inicializar a matriz de células raspadas
        vm.scratchedCells = Array(vm.gameBoard.length).fill().map(() => 
          Array(vm.gameBoard[0].length).fill(false));
      })
      .catch(error => {
        console.error(`Erro ao jogar o jogo ${vm.gameId}:`, error);
        vm.error = 'Ocorreu um erro ao iniciar o jogo. Por favor, tente novamente.';
        vm.isPlaying = false;
      });
  }
  
  function resetGame() {
    vm.isPlaying = false;
    vm.playResult = null;
    vm.hasWon = false;
    vm.revealedCells = 0;
    vm.scratchedCells = [];
    vm.error = null;
  }
  
  function revealCard(row, col) {
    // Verificar se o jogo está em andamento
    if (!vm.isPlaying || !vm.playResult) {
      return;
    }
    
    // Verificar se a célula já foi raspada
    if (vm.scratchedCells[row][col]) {
      return;
    }
    
    // Marcar a célula como raspada
    vm.scratchedCells[row][col] = true;
    vm.revealedCells++;
    
    // Verificar se ganhou após cada célula raspada
    vm.hasWon = checkWin();
    
    // Se todas as células forem raspadas ou houve vitória, finalizar jogo
    if (vm.hasWon || vm.revealedCells === vm.gameBoard.length * vm.gameBoard[0].length) {
      // Se ganhou, mostrar animação de confete
      if (vm.hasWon && typeof confetti !== 'undefined') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      
      // Atualizar o saldo do usuário no serviço
      if (AuthService.user) {
        if (vm.playResult.win) {
          AuthService.user.balance = (parseFloat(AuthService.user.balance) + parseFloat(vm.playResult.amount)).toFixed(2);
        } else {
          AuthService.user.balance = (parseFloat(AuthService.user.balance)).toFixed(2);
        }
      }
    }
  }
  
  function canPlay() {
    // Verificar se o usuário tem saldo suficiente
    if (!vm.user || !vm.game) {
      return false;
    }
    
    return parseFloat(vm.user.balance) >= parseFloat(vm.game.price);
  }
  
  function checkWin() {
    // Verificar se já temos um resultado do backend
    if (vm.playResult && typeof vm.playResult.win !== 'undefined') {
      // Se o backend determinou o resultado, usar esse valor
      return vm.playResult.win;
    }
    
    // Verificação manual baseada nas células raspadas
    // (isso seria implementado de acordo com a lógica específica do jogo)
    // Exemplo: verificar se há 3 símbolos iguais revelados
    
    const symbols = {};
    const minMatches = vm.game.minMatchesToWin || 3;
    
    // Contar os símbolos revelados
    for (let i = 0; i < vm.gameBoard.length; i++) {
      for (let j = 0; j < vm.gameBoard[i].length; j++) {
        if (vm.scratchedCells[i][j]) {
          const symbol = vm.gameBoard[i][j];
          symbols[symbol] = (symbols[symbol] || 0) + 1;
          
          // Se algum símbolo apareceu o número mínimo de vezes, ganhou
          if (symbols[symbol] >= minMatches) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
}

// Injeção de dependências
GameDetailController.$inject = ['$scope', '$routeParams', 'GameService', 'AuthService']; 