// Controller de administração de transações
app.controller('AdminTransactionsController', ['$scope', 'PaymentService', 
  function($scope, PaymentService) {
    const vm = this;
    
    // Propriedades
    vm.transactions = [];
    vm.selectedTransaction = null;
    vm.isLoading = true;
    vm.error = null;
    vm.success = null;
    vm.showStatusModal = false;
    vm.showDetailsModal = false;
    
    // Paginação
    vm.currentPage = 1;
    vm.itemsPerPage = 20;
    vm.totalItems = 0;
    
    // Filtros
    vm.searchQuery = '';
    vm.filters = {
      status: 'all', // all, pending, completed, failed, canceled
      type: 'all', // all, deposit, withdrawal, game_purchase, prize
      dateRange: {
        start: null,
        end: null
      },
      sortBy: 'created_at', // created_at, amount, user
      sortOrder: 'desc' // asc, desc
    };
    
    // Form de status
    vm.statusForm = {
      status: '',
      notes: ''
    };
    
    // Métodos públicos
    vm.loadTransactions = loadTransactions;
    vm.viewTransaction = viewTransaction;
    vm.openStatusModal = openStatusModal;
    vm.updateTransactionStatus = updateTransactionStatus;
    vm.changePage = changePage;
    vm.resetFilters = resetFilters;
    vm.applyFilters = applyFilters;
    vm.formatTransactionStatus = formatTransactionStatus;
    vm.formatTransactionType = formatTransactionType;
    vm.formatCurrency = formatCurrency;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      loadTransactions();
    }
    
    function loadTransactions() {
      vm.isLoading = true;
      
      const params = {
        page: vm.currentPage,
        limit: vm.itemsPerPage,
        search: vm.searchQuery,
        status: vm.filters.status !== 'all' ? vm.filters.status : null,
        type: vm.filters.type !== 'all' ? vm.filters.type : null,
        startDate: vm.filters.dateRange.start,
        endDate: vm.filters.dateRange.end,
        sortBy: vm.filters.sortBy,
        sortOrder: vm.filters.sortOrder
      };
      
      PaymentService.getTransactions(params)
        .then(function(response) {
          vm.transactions = response.data || [];
          vm.totalItems = response.meta?.total || vm.transactions.length;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar transações: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao carregar transações:', error);
        });
    }
    
    function viewTransaction(transactionId) {
      vm.isLoading = true;
      
      PaymentService.getTransactionById(transactionId)
        .then(function(response) {
          vm.selectedTransaction = response;
          vm.showDetailsModal = true;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar detalhes da transação: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao carregar detalhes da transação:', error);
        });
    }
    
    function openStatusModal(transaction) {
      vm.selectedTransaction = transaction;
      vm.statusForm = {
        status: transaction.status,
        notes: transaction.notes || ''
      };
      vm.showStatusModal = true;
    }
    
    function updateTransactionStatus() {
      vm.isLoading = true;
      
      PaymentService.updateTransactionStatus(vm.selectedTransaction.id, vm.statusForm)
        .then(function(response) {
          vm.success = 'Status da transação atualizado com sucesso!';
          vm.showStatusModal = false;
          
          // Atualizar transação na lista
          const index = vm.transactions.findIndex(t => t.id === vm.selectedTransaction.id);
          if (index !== -1) {
            vm.transactions[index] = response;
          }
          
          vm.selectedTransaction = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao atualizar status da transação: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao atualizar status da transação:', error);
        });
    }
    
    function changePage(page) {
      vm.currentPage = page;
      loadTransactions();
    }
    
    function resetFilters() {
      vm.searchQuery = '';
      vm.filters = {
        status: 'all',
        type: 'all',
        dateRange: {
          start: null,
          end: null
        },
        sortBy: 'created_at',
        sortOrder: 'desc'
      };
      
      vm.currentPage = 1;
      loadTransactions();
    }
    
    function applyFilters() {
      vm.currentPage = 1;
      loadTransactions();
    }
    
    // Funções de formatação
    function formatTransactionStatus(status) {
      const statusMap = {
        'pending': 'Pendente',
        'processing': 'Processando',
        'completed': 'Concluída',
        'failed': 'Falha',
        'canceled': 'Cancelada'
      };
      
      return statusMap[status] || status;
    }
    
    function formatTransactionType(type) {
      const typeMap = {
        'deposit': 'Depósito',
        'withdrawal': 'Saque',
        'game_purchase': 'Compra de jogo',
        'prize': 'Prêmio'
      };
      
      return typeMap[type] || type;
    }
    
    function formatCurrency(value) {
      return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
    }
  }
]); 