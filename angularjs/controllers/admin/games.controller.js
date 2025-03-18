// Controller de administração de jogos
app.controller('AdminGamesController', ['$scope', 'GameService', 
  function($scope, GameService) {
    const vm = this;
    
    // Propriedades
    vm.games = [];
    vm.selectedGame = null;
    vm.isLoading = true;
    vm.error = null;
    vm.success = null;
    vm.showDeleteModal = false;
    vm.showEditModal = false;
    vm.showCreateModal = false;
    
    // Paginação
    vm.currentPage = 1;
    vm.itemsPerPage = 10;
    vm.totalItems = 0;
    
    // Filtros
    vm.searchQuery = '';
    vm.filters = {
      category: 'all',
      status: 'all', // all, active, inactive
      sortBy: 'created_at', // created_at, name, price, popularity
      sortOrder: 'desc' // asc, desc
    };
    
    // Form de jogo
    vm.gameForm = {
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      imageUrl: '',
      isActive: true,
      featured: false,
      winProbability: 10, // percentual
      minPrize: 0,
      maxPrize: 100,
      rules: ''
    };
    
    // Métodos públicos
    vm.loadGames = loadGames;
    vm.viewGame = viewGame;
    vm.openCreateModal = openCreateModal;
    vm.openEditModal = openEditModal;
    vm.saveGame = saveGame;
    vm.confirmDeleteGame = confirmDeleteGame;
    vm.deleteGame = deleteGame;
    vm.changePage = changePage;
    vm.resetFilters = resetFilters;
    vm.applyFilters = applyFilters;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      loadGames();
    }
    
    function loadGames() {
      vm.isLoading = true;
      
      const params = {
        page: vm.currentPage,
        limit: vm.itemsPerPage,
        search: vm.searchQuery,
        category: vm.filters.category !== 'all' ? vm.filters.category : null,
        status: vm.filters.status,
        sortBy: vm.filters.sortBy,
        sortOrder: vm.filters.sortOrder
      };
      
      GameService.getGames(params)
        .then(function(response) {
          vm.games = response.data || response || [];
          if (response.meta) {
            vm.totalItems = response.meta.total;
          } else {
            vm.totalItems = vm.games.length;
          }
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar jogos: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao carregar jogos:', error);
        });
    }
    
    function viewGame(gameId) {
      vm.isLoading = true;
      
      GameService.getGameById(gameId)
        .then(function(response) {
          vm.selectedGame = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar detalhes do jogo: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao carregar detalhes do jogo:', error);
        });
    }
    
    function openCreateModal() {
      vm.gameForm = {
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        category: '',
        imageUrl: '',
        isActive: true,
        featured: false,
        winProbability: 10,
        minPrize: 0,
        maxPrize: 100,
        rules: ''
      };
      
      vm.selectedGame = null;
      vm.showCreateModal = true;
    }
    
    function openEditModal(game) {
      vm.gameForm = {
        name: game.name,
        description: game.description,
        price: game.price,
        originalPrice: game.originalPrice || game.price,
        category: game.category || '',
        imageUrl: game.imageUrl || '',
        isActive: game.isActive !== false,
        featured: game.featured === true,
        winProbability: game.winProbability || 10,
        minPrize: game.minPrize || 0,
        maxPrize: game.maxPrize || 100,
        rules: game.rules || ''
      };
      
      vm.selectedGame = game;
      vm.showEditModal = true;
    }
    
    function saveGame() {
      vm.isLoading = true;
      
      const savePromise = vm.selectedGame 
        ? GameService.updateGame(vm.selectedGame.id, vm.gameForm) // Atualizar
        : GameService.createGame(vm.gameForm); // Criar novo
      
      savePromise
        .then(function(response) {
          vm.success = vm.selectedGame 
            ? 'Jogo atualizado com sucesso!' 
            : 'Novo jogo criado com sucesso!';
            
          vm.showEditModal = false;
          vm.showCreateModal = false;
          
          if (vm.selectedGame) {
            // Atualizar jogo na lista
            const index = vm.games.findIndex(g => g.id === vm.selectedGame.id);
            if (index !== -1) {
              vm.games[index] = response;
            }
          } else {
            // Adicionar novo jogo à lista
            vm.games.unshift(response);
          }
          
          vm.selectedGame = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          const action = vm.selectedGame ? 'atualizar' : 'criar';
          vm.error = `Erro ao ${action} jogo: ` + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error(`Erro ao ${action} jogo:`, error);
        });
    }
    
    function confirmDeleteGame(game) {
      vm.selectedGame = game;
      vm.showDeleteModal = true;
    }
    
    function deleteGame() {
      vm.isLoading = true;
      
      GameService.deleteGame(vm.selectedGame.id)
        .then(function() {
          vm.success = 'Jogo excluído com sucesso!';
          vm.showDeleteModal = false;
          
          // Remover jogo da lista
          vm.games = vm.games.filter(g => g.id !== vm.selectedGame.id);
          vm.selectedGame = null;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao excluir jogo: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          vm.showDeleteModal = false;
          console.error('Erro ao excluir jogo:', error);
        });
    }
    
    function changePage(page) {
      vm.currentPage = page;
      loadGames();
    }
    
    function resetFilters() {
      vm.searchQuery = '';
      vm.filters = {
        category: 'all',
        status: 'all',
        sortBy: 'created_at',
        sortOrder: 'desc'
      };
      
      vm.currentPage = 1;
      loadGames();
    }
    
    function applyFilters() {
      vm.currentPage = 1;
      loadGames();
    }
  }
]); 