// Módulo principal da aplicação
(function() {
  // Tentar obter o módulo existente, se não existir, criar
  try {
    angular.module('raspadinhaApp');
  } catch (err) {
    // O módulo não existe, criar
    angular.module('raspadinhaApp', ['ngRoute', 'ngAnimate']);
  }
  
  // Referência ao módulo
  var app = angular.module('raspadinhaApp');

  // Configuração das constantes
  app.config(['$provide', function($provide) {
    // API URL e configurações são definidas pelo módulo de constantes
    console.log('Configurando constantes da aplicação');
  }]);

  // Configuração de rotas
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    // Habilitando HTML5 mode para URLs mais limpas (opcional, depende da configuração do servidor)
    // $locationProvider.html5Mode(true);
    
    $routeProvider
      // Home
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController',
        controllerAs: 'vm'
      })
      
      // Autenticação
      .when('/login', {
        templateUrl: 'views/auth/login.html',
        controller: 'LoginController',
        controllerAs: 'vm',
        resolve: {
          isAuthRoute: function() { return true; }
        }
      })
      .when('/register', {
        templateUrl: 'views/auth/register.html',
        controller: 'RegisterController',
        controllerAs: 'vm',
        resolve: {
          isAuthRoute: function() { return true; }
        }
      })
      .when('/forgot-password', {
        templateUrl: 'views/auth/forgot-password.html',
        controller: 'LoginController',
        controllerAs: 'vm',
        resolve: {
          isAuthRoute: function() { return true; }
        }
      })
      
      // Jogos
      .when('/games/:gameId', {
        templateUrl: 'views/games/game-detail.html',
        controller: 'GameDetailController',
        controllerAs: 'vm'
      })
      
      // Perfil do usuário
      .when('/profile', {
        templateUrl: 'views/profile/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        resolve: {
          authRequired: ['AuthService', function(AuthService) {
            return AuthService.requireAuth();
          }]
        }
      })
      
      // Páginas de pagamento
      .when('/deposit', {
        templateUrl: 'views/payment/deposit.html',
        controller: 'DepositController',
        controllerAs: 'vm',
        resolve: {
          authRequired: ['AuthService', function(AuthService) {
            return AuthService.requireAuth();
          }]
        }
      })
      .when('/withdraw', {
        templateUrl: 'views/payment/withdraw.html',
        controller: 'WithdrawController',
        controllerAs: 'vm',
        resolve: {
          authRequired: ['AuthService', function(AuthService) {
            return AuthService.requireAuth();
          }]
        }
      })
      
      // Área administrativa
      .when('/admin', {
        templateUrl: 'views/admin/dashboard.html',
        controller: 'AdminDashboardController',
        controllerAs: 'vm',
        resolve: {
          isAdminRoute: function() { return true; },
          adminRequired: ['AdminService', function(AdminService) {
            return AdminService.requireAdmin();
          }]
        }
      })
      .when('/admin/users', {
        templateUrl: 'views/admin/users.html',
        controller: 'AdminUsersController',
        controllerAs: 'vm',
        resolve: {
          isAdminRoute: function() { return true; },
          adminRequired: ['AdminService', function(AdminService) {
            return AdminService.requireAdmin();
          }]
        }
      })
      .when('/admin/games', {
        templateUrl: 'views/admin/games.html',
        controller: 'AdminGamesController',
        controllerAs: 'vm',
        resolve: {
          isAdminRoute: function() { return true; },
          adminRequired: ['AdminService', function(AdminService) {
            return AdminService.requireAdmin();
          }]
        }
      })
      
      // Página 404
      .when('/not-found', {
        templateUrl: 'views/not-found.html',
        controller: 'NotFoundController',
        controllerAs: 'vm'
      })
      
      // Redirecionar para página 404 para rotas não encontradas
      .otherwise({
        redirectTo: '/not-found'
      });
  }]);

  // Configuração dos interceptors HTTP
  app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('HttpInterceptors');
  }]);

  // Run block para inicialização
  app.run(['$rootScope', '$injector', '$location', 
    function($rootScope, $injector, $location) {
      console.log('Inicializando aplicação AngularJS');
      
      // Método auxiliar para pegar o ano atual (para o rodapé)
      $rootScope.currentYear = new Date().getFullYear();
      
      // Método auxiliar para verificar se o usuário está autenticado
      $rootScope.isAuthenticated = function() {
        try {
          var AuthService = $injector.get('AuthService');
          return AuthService.isAuthenticated();
        } catch (e) {
          console.error('Erro ao verificar autenticação:', e);
          return false;
        }
      };
      
      // Inicializar serviços de forma segura, evitando dependências circulares
      function safeInitService(serviceName, initMethod) {
        try {
          var service = $injector.get(serviceName);
          if (service && typeof service[initMethod] === 'function') {
            service[initMethod]();
            return service;
          }
        } catch (e) {
          console.error('Erro ao inicializar ' + serviceName + ':', e);
          return null;
        }
      }
      
      // Inicializar os serviços principais
      var AuthService = safeInitService('AuthService', 'initialize');
      var AdminService = safeInitService('AdminService', 'initialize');
      
      // Adicionar o serviço de autenticação ao escopo raiz para acesso nos templates
      if (AuthService) {
        $rootScope.AuthService = AuthService;
      }
      
      // Adicionar utilitários e verificações de rota ao escopo raiz
      $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
        if (current && current.$$route) {
          $rootScope.title = current.$$route.title || 'Raspadinha App';
          
          // Verificar se estamos em uma rota de administração
          $rootScope.isAdminRoute = !!current.resolve?.isAdminRoute;
          
          // Verificar se estamos em uma rota de autenticação
          $rootScope.isAuthRoute = !!current.resolve?.isAuthRoute;
        }
      });
    }
  ]);
})(); 