/**
 * Módulo principal da aplicação
 */
angular.module('raspadinhaApp', [
  'ngRoute',
  'ngAnimate'
]);

/**
 * Configuração de rotas da aplicação
 */
angular.module('raspadinhaApp').config(['$routeProvider', '$locationProvider', 
function($routeProvider, $locationProvider) {
  
  // Configuração das rotas
  $routeProvider
    .when('/', {
      templateUrl: 'views/home/home.html',
      controller: 'HomeController',
      controllerAs: 'vm'
    })
    .when('/login', {
      templateUrl: 'views/auth/login.html',
      controller: 'LoginController',
      controllerAs: 'vm'
    })
    .when('/register', {
      templateUrl: 'views/auth/register.html',
      controller: 'RegisterController',
      controllerAs: 'vm'
    })
    .when('/profile', {
      templateUrl: 'views/profile/profile.html',
      controller: 'ProfileController',
      controllerAs: 'vm',
      resolve: {
        auth: ['AuthService', function(AuthService) {
          return AuthService.verifyToken();
        }]
      }
    })
    .when('/games', {
      templateUrl: 'views/games/game-list.html',
      controller: 'GameListController',
      controllerAs: 'vm'
    })
    .when('/games/:id', {
      templateUrl: 'views/games/game-detail.html',
      controller: 'GameDetailController',
      controllerAs: 'vm'
    })
    .when('/deposit', {
      templateUrl: 'views/payment/deposit.html',
      controller: 'DepositController',
      controllerAs: 'vm',
      resolve: {
        auth: ['AuthService', function(AuthService) {
          return AuthService.verifyToken();
        }]
      }
    })
    .when('/withdraw', {
      templateUrl: 'views/payment/withdraw.html',
      controller: 'WithdrawController',
      controllerAs: 'vm',
      resolve: {
        auth: ['AuthService', function(AuthService) {
          return AuthService.verifyToken();
        }]
      }
    })
    .otherwise({
      redirectTo: '/'
    });
    
  // Configuração para usar URLs sem hash
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: true
  });
}]);

/**
 * Configuração de interceptadores HTTP
 */
angular.module('raspadinhaApp').config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('HttpInterceptors');
}]);

/**
 * Inicialização da aplicação
 */
angular.module('raspadinhaApp').run(['$rootScope', '$location', 'AuthService', 
function($rootScope, $location, AuthService) {
  
  // Adicionar o ano atual para ser usado em toda a aplicação
  $rootScope.currentYear = new Date().getFullYear();
  
  // Verificar autenticação nas mudanças de rota
  $rootScope.$on('$routeChangeStart', function(event, next) {
    if (next.$$route && next.$$route.resolve && next.$$route.resolve.auth) {
      if (!AuthService.isAuthenticated()) {
        $location.path('/login');
      }
    }
  });
  
  // Expõe a função de verificação de autenticação ao rootScope para uso nas views
  $rootScope.isAuthenticated = function() {
    return AuthService.isAuthenticated();
  };
  
  // Expõe a função de logout ao rootScope para uso nas views
  $rootScope.logout = function() {
    AuthService.logout();
    $location.path('/login');
  };
}]); 