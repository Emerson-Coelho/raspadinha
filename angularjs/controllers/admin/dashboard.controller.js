// Controller de dashboard administrativo
app.controller('AdminDashboardController', ['$scope', 'AdminService', 'UserService', 'GameService', 'PaymentService',
  function($scope, AdminService, UserService, GameService, PaymentService) {
    const vm = this;
    
    // Propriedades
    vm.isLoading = true;
    vm.error = null;
    vm.stats = {
      users: {
        total: 0,
        newToday: 0,
        newThisWeek: 0,
        active: 0
      },
      games: {
        total: 0,
        playsToday: 0,
        playsThisWeek: 0,
        popularGame: null
      },
      transactions: {
        revenueToday: 0,
        revenueThisWeek: 0,
        revenueThisMonth: 0,
        totalRevenue: 0,
        pendingTransactions: 0
      }
    };
    
    // Métodos públicos
    vm.refreshData = refreshData;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      vm.isLoading = true;
      
      // Carregar todas as estatísticas em paralelo
      Promise.all([
        UserService.getUserStats(),
        GameService.getAdminGameStats(),
        PaymentService.getPaymentStats()
      ])
      .then(function(results) {
        const [userStats, gameStats, paymentStats] = results;
        
        // Atualizar estatísticas de usuários
        vm.stats.users = userStats;
        
        // Atualizar estatísticas de jogos
        vm.stats.games = gameStats;
        
        // Atualizar estatísticas de pagamentos
        vm.stats.transactions = paymentStats;
        
        vm.isLoading = false;
      })
      .catch(function(error) {
        vm.error = 'Erro ao carregar estatísticas: ' + error.message;
        vm.isLoading = false;
        console.error('Erro ao carregar estatísticas do dashboard:', error);
      });
    }
    
    function refreshData() {
      initialize();
    }
  }
]); 