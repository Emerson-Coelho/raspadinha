/**
 * Serviço de Autenticação
 * Gerencia autenticação, registro e estado do usuário
 */
angular.module('raspadinhaApp').factory('AuthService', ['$http', '$window', '$q', 'APP_CONSTANTS', 
function($http, $window, $q, APP_CONSTANTS) {
    
    // Armazenamento do usuário atual
    var currentUser = null;
    
    // Verifica se há um token no localStorage ao iniciar
    function init() {
        var token = $window.localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
        if (token) {
            var storedUser = $window.localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.USER);
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
            }
        }
    }
    
    // Executa inicialização
    init();
    
    return {
        /**
         * Efetua login do usuário
         * @param {Object} credentials - Credenciais de login (email, senha)
         * @returns {Promise} Promise com resultado da operação
         */
        login: function(credentials) {
            return $http.post(APP_CONSTANTS.API_URL + '/auth/login', credentials)
                .then(function(response) {
                    var token = response.data.token;
                    var user = response.data.user;
                    
                    // Armazena dados na sessão
                    $window.localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN, token);
                    $window.localStorage.setItem(APP_CONSTANTS.STORAGE_KEYS.USER, JSON.stringify(user));
                    
                    // Atualiza usuário atual
                    currentUser = user;
                    
                    return user;
                });
        },
        
        /**
         * Registra um novo usuário
         * @param {Object} userData - Dados do usuário para registro
         * @returns {Promise} Promise com resultado da operação
         */
        register: function(userData) {
            return $http.post(APP_CONSTANTS.API_URL + '/auth/register', userData)
                .then(function(response) {
                    return response.data;
                });
        },
        
        /**
         * Efetua logout do usuário atual
         */
        logout: function() {
            // Remove dados da sessão
            $window.localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
            $window.localStorage.removeItem(APP_CONSTANTS.STORAGE_KEYS.USER);
            
            // Limpa usuário atual
            currentUser = null;
        },
        
        /**
         * Verifica se o usuário está autenticado
         * @returns {Boolean} true se autenticado, false caso contrário
         */
        isAuthenticated: function() {
            return !!currentUser;
        },
        
        /**
         * Recupera o usuário atual
         * @returns {Object} Dados do usuário atual ou null
         */
        getCurrentUser: function() {
            return currentUser;
        },
        
        /**
         * Recupera o token de autenticação atual
         * @returns {String} Token de autenticação ou null
         */
        getToken: function() {
            return $window.localStorage.getItem(APP_CONSTANTS.STORAGE_KEYS.TOKEN);
        },
        
        /**
         * Verifica se o token atual é válido
         * @returns {Promise} Promise com resultado da validação
         */
        verifyToken: function() {
            var token = this.getToken();
            
            if (!token) {
                return $q.reject('Token não encontrado');
            }
            
            return $http.get(APP_CONSTANTS.API_URL + '/auth/verify')
                .then(function(response) {
                    return response.data;
                })
                .catch(function(error) {
                    // Se o token for inválido, faz logout
                    if (error.status === 401) {
                        this.logout();
                    }
                    return $q.reject(error);
                }.bind(this));
        },
        
        /**
         * Solicita redefinição de senha
         * @param {String} email - Email do usuário
         * @returns {Promise} Promise com resultado da operação
         */
        requestPasswordReset: function(email) {
            return $http.post(APP_CONSTANTS.API_URL + '/auth/forgot-password', { email: email })
                .then(function(response) {
                    return response.data;
                });
        },
        
        /**
         * Redefine a senha do usuário
         * @param {Object} resetData - Dados de redefinição (token, novaSenha)
         * @returns {Promise} Promise com resultado da operação
         */
        resetPassword: function(resetData) {
            return $http.post(APP_CONSTANTS.API_URL + '/auth/reset-password', resetData)
                .then(function(response) {
                    return response.data;
                });
        }
    };
}]); 