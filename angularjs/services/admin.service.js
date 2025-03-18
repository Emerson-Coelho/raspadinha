// Serviço de administração
(function() {
  angular.module('raspadinhaApp').service('AdminService', ['$http', '$window', '$q', '$location', 'APP_CONSTANTS',
    function($http, $window, $q, $location, APP_CONSTANTS) {
      const service = {
        token: null,
        admin: null,
        isAdmin: false,
        initialize: initialize,
        login: login,
        logout: logout,
        getAdminProfile: getAdminProfile,
        requireAdmin: requireAdmin,
        saveToken: saveToken,
        getToken: getToken
      };
      
      return service;
      
      // Inicializar o serviço de admin
      function initialize() {
        console.log('Inicializando serviço de administração');
        const token = getToken();
        
        if (token) {
          service.token = token;
          service.isAdmin = true;
          return getAdminProfile();
        }
        
        return $q.resolve(null);
      }
      
      // Login de administrador
      function login(credentials) {
        return $http.post(`${APP_CONSTANTS.API_URL}/admin/login`, credentials)
          .then(response => {
            const data = response.data;
            
            if (data && data.token) {
              saveToken(data.token);
              service.token = data.token;
              service.isAdmin = true;
              return getAdminProfile();
            }
            
            return $q.reject('Falha na autenticação de administrador');
          });
      }
      
      // Logout de administrador
      function logout() {
        service.token = null;
        service.admin = null;
        service.isAdmin = false;
        $window.localStorage.removeItem(APP_CONSTANTS.ADMIN_TOKEN_KEY);
        $location.path('/admin/login');
      }
      
      // Obter perfil do administrador
      function getAdminProfile() {
        if (!service.token) {
          return $q.reject('Não autenticado como administrador');
        }
        
        return $http.get(`${APP_CONSTANTS.API_URL}/admin/profile`)
          .then(response => {
            service.admin = response.data;
            return service.admin;
          })
          .catch(error => {
            console.error('Erro ao obter perfil de administrador:', error);
            logout();
            return $q.reject(error);
          });
      }
      
      // Requerir autenticação de administrador
      function requireAdmin() {
        if (service.isAdmin) {
          return $q.resolve();
        }
        
        const token = getToken();
        
        if (token) {
          service.token = token;
          service.isAdmin = true;
          return getAdminProfile();
        }
        
        // Redirecionar para login de administrador
        $location.path('/admin/login');
        return $q.reject('Não autenticado como administrador');
      }
      
      // Salvar token de administrador
      function saveToken(token) {
        $window.localStorage.setItem(APP_CONSTANTS.ADMIN_TOKEN_KEY, token);
      }
      
      // Obter token de administrador
      function getToken() {
        return $window.localStorage.getItem(APP_CONSTANTS.ADMIN_TOKEN_KEY);
      }
    }
  ]);
})(); 