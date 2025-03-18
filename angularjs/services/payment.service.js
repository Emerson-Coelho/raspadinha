// Serviço de pagamento
app.service('PaymentService', ['$http', '$q', 'APP_CONSTANTS',
  function($http, $q, APP_CONSTANTS) {
    const service = {
      // Métodos para usuários
      getPaymentMethods: getPaymentMethods,
      createDeposit: createDeposit,
      getDepositStatus: getDepositStatus,
      
      // Métodos para saque
      getWithdrawalMethods: getWithdrawalMethods,
      getBankList: getBankList,
      createWithdrawal: createWithdrawal,
      getWithdrawalStatus: getWithdrawalStatus,
      
      // Métodos para administradores
      getTransactions: getTransactions,
      getTransactionById: getTransactionById,
      updateTransactionStatus: updateTransactionStatus,
      getPaymentStats: getPaymentStats
    };
    
    return service;
    
    // Obter métodos de pagamento disponíveis
    function getPaymentMethods() {
      return $http.get(`${APP_CONSTANTS.API_URL}/payment/methods`)
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao obter métodos de pagamento:', error);
          return $q.reject(error);
        });
    }
    
    // Criar um novo depósito
    function createDeposit(depositData) {
      return $http.post(`${APP_CONSTANTS.API_URL}/payment/deposit`, depositData)
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao criar depósito:', error);
          return $q.reject(error);
        });
    }
    
    // Verificar status de um depósito
    function getDepositStatus(depositId) {
      return $http.get(`${APP_CONSTANTS.API_URL}/payment/deposit/${depositId}`)
        .then(response => response.data)
        .catch(error => {
          console.error(`Erro ao verificar status do depósito ${depositId}:`, error);
          return $q.reject(error);
        });
    }
    
    // Obter métodos de saque disponíveis
    function getWithdrawalMethods() {
      return $http.get(`${APP_CONSTANTS.API_URL}/payment/withdrawal/methods`)
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao obter métodos de saque:', error);
          return $q.reject(error);
        });
    }
    
    // Obter lista de bancos para transferência
    function getBankList() {
      return $http.get(`${APP_CONSTANTS.API_URL}/payment/banks`)
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao obter lista de bancos:', error);
          return $q.reject(error);
        });
    }
    
    // Criar um novo saque
    function createWithdrawal(withdrawalData) {
      return $http.post(`${APP_CONSTANTS.API_URL}/payment/withdrawal`, withdrawalData)
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao criar solicitação de saque:', error);
          return $q.reject(error);
        });
    }
    
    // Verificar status de um saque
    function getWithdrawalStatus(withdrawalId) {
      return $http.get(`${APP_CONSTANTS.API_URL}/payment/withdrawal/${withdrawalId}`)
        .then(response => response.data)
        .catch(error => {
          console.error(`Erro ao verificar status do saque ${withdrawalId}:`, error);
          return $q.reject(error);
        });
    }
    
    // Admin: Obter todas as transações
    function getTransactions(params) {
      return $http.get(`${APP_CONSTANTS.API_URL}/admin/transactions`, { params: params })
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao obter transações:', error);
          return $q.reject(error);
        });
    }
    
    // Admin: Obter transação por ID
    function getTransactionById(transactionId) {
      return $http.get(`${APP_CONSTANTS.API_URL}/admin/transactions/${transactionId}`)
        .then(response => response.data)
        .catch(error => {
          console.error(`Erro ao obter transação ${transactionId}:`, error);
          return $q.reject(error);
        });
    }
    
    // Admin: Atualizar status de uma transação
    function updateTransactionStatus(transactionId, statusData) {
      return $http.put(`${APP_CONSTANTS.API_URL}/admin/transactions/${transactionId}/status`, statusData)
        .then(response => response.data)
        .catch(error => {
          console.error(`Erro ao atualizar status da transação ${transactionId}:`, error);
          return $q.reject(error);
        });
    }
    
    // Admin: Obter estatísticas de pagamentos
    function getPaymentStats() {
      return $http.get(`${APP_CONSTANTS.API_URL}/admin/payment-stats`)
        .then(response => response.data)
        .catch(error => {
          console.error('Erro ao obter estatísticas de pagamentos:', error);
          return $q.reject(error);
        });
    }
  }
]); 