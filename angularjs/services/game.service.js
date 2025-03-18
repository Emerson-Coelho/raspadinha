/**
 * Serviço para operações relacionadas a jogos de raspadinha
 */
angular.module('raspadinhaApp').factory('GameService', ['$http', 'APP_CONSTANTS', 
function($http, APP_CONSTANTS) {
  // URL base para as operações com jogos
  var baseUrl = APP_CONSTANTS.API_URL + '/games';
  
  return {
    /**
     * Obter lista de jogos com filtros e paginação
     * @param {Object} params - Parâmetros de filtro e paginação
     * @returns {Promise} Promise com os jogos encontrados
     */
    getGames: function(params) {
      return $http.get(baseUrl, { params: params })
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter detalhes de um jogo específico
     * @param {string} gameId - ID do jogo
     * @returns {Promise} Promise com os detalhes do jogo
     */
    getGameById: function(gameId) {
      return $http.get(baseUrl + '/' + gameId)
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Jogar um jogo específico
     * @param {string} gameId - ID do jogo
     * @returns {Promise} Promise com o resultado do jogo
     */
    playGame: function(gameId) {
      return $http.post(baseUrl + '/' + gameId + '/play')
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter histórico de jogos do usuário
     * @param {Object} params - Parâmetros de filtro e paginação
     * @returns {Promise} Promise com o histórico de jogos
     */
    getUserGameHistory: function(params) {
      return $http.get(APP_CONSTANTS.API_URL + '/users/me/games', { params: params })
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter estatísticas de um jogo
     * @param {string} gameId - ID do jogo
     * @returns {Promise} Promise com as estatísticas do jogo
     */
    getGameStats: function(gameId) {
      return $http.get(baseUrl + '/' + gameId + '/stats')
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter estatísticas gerais de todos os jogos
     * @returns {Promise} Promise com as estatísticas gerais
     */
    getAllGameStats: function() {
      return $http.get(baseUrl + '/stats')
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter categorias de jogos
     * @returns {Promise} Promise com as categorias disponíveis
     */
    getGameCategories: function() {
      return $http.get(baseUrl + '/categories')
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter promoções ativas
     * @param {Object} params - Parâmetros de filtro e paginação
     * @returns {Promise} Promise com as promoções encontradas
     */
    getPromotions: function(params) {
      return $http.get(APP_CONSTANTS.API_URL + '/promotions', { params: params })
        .then(function(response) {
          return response.data;
        });
    },
    
    /**
     * Obter recomendações de jogos para o usuário
     * @param {number} limit - Número máximo de recomendações
     * @returns {Promise} Promise com os jogos recomendados
     */
    getRecommendedGames: function(limit) {
      var params = limit ? { limit: limit } : {};
      return $http.get(baseUrl + '/recommended', { params: params })
        .then(function(response) {
          return response.data;
        });
    }
  };
}]); 