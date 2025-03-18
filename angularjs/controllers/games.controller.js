const app = angular.module('raspadinhaApp');

// Controller de listagem de jogos
app.controller('GamesController', ['$scope', '$state', 'GameService', 
  function($scope, $state, GameService) {
    const vm = this;
    
    // Propriedades
    vm.games = [];
    vm.filteredGames = [];
    vm.categories = [];
    vm.isLoading = true;
    vm.error = null;
    
    // Filtros
    vm.filters = {
      search: '',
      category: 'all',
      priceRange: [0, 100],
      sortBy: 'newest'
    };
    
    // Métodos públicos
    vm.goToGameDetail = goToGameDetail;
    vm.applyFilters = applyFilters;
    vm.resetFilters = resetFilters;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      vm.isLoading = true;
      
      GameService.getGames()
        .then(function(response) {
          vm.games = response;
          vm.filteredGames = response;
          
          // Extrair categorias únicas dos jogos
          const categorySet = new Set();
          response.forEach(function(game) {
            if (game.category) {
              categorySet.add(game.category);
            }
          });
          vm.categories = Array.from(categorySet);
          
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar jogos: ' + error.message;
          vm.isLoading = false;
          console.error('Erro ao carregar jogos:', error);
        });
    }
    
    function goToGameDetail(gameId) {
      $state.go('game-detail', { id: gameId });
    }
    
    function applyFilters() {
      vm.isLoading = true;
      
      // Filtrar jogos
      vm.filteredGames = vm.games.filter(function(game) {
        // Filtrar por termo de busca
        if (vm.filters.search && 
            !game.name.toLowerCase().includes(vm.filters.search.toLowerCase())) {
          return false;
        }
        
        // Filtrar por categoria
        if (vm.filters.category !== 'all' && game.category !== vm.filters.category) {
          return false;
        }
        
        // Filtrar por faixa de preço
        if (game.price < vm.filters.priceRange[0] || 
            game.price > vm.filters.priceRange[1]) {
          return false;
        }
        
        return true;
      });
      
      // Ordenar jogos
      switch (vm.filters.sortBy) {
        case 'newest':
          vm.filteredGames.sort(function(a, b) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          break;
        case 'priceAsc':
          vm.filteredGames.sort(function(a, b) {
            return a.price - b.price;
          });
          break;
        case 'priceDesc':
          vm.filteredGames.sort(function(a, b) {
            return b.price - a.price;
          });
          break;
        case 'popularity':
          vm.filteredGames.sort(function(a, b) {
            return b.playCount - a.playCount;
          });
          break;
      }
      
      vm.isLoading = false;
    }
    
    function resetFilters() {
      vm.filters = {
        search: '',
        category: 'all',
        priceRange: [0, 100],
        sortBy: 'newest'
      };
      
      applyFilters();
    }
    
    // Observar mudanças nos filtros
    $scope.$watch('vm.filters', function() {
      applyFilters();
    }, true);
  }
]); 