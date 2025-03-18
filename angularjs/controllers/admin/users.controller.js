// Controller de administração de usuários
app.controller('AdminUsersController', ['$scope', 'UserService', 
  function($scope, UserService) {
    const vm = this;
    
    // Propriedades
    vm.users = [];
    vm.selectedUser = null;
    vm.isLoading = true;
    vm.error = null;
    vm.success = null;
    vm.showDeleteModal = false;
    vm.showEditModal = false;
    
    // Paginação
    vm.currentPage = 1;
    vm.itemsPerPage = 10;
    vm.totalItems = 0;
    
    // Filtros
    vm.searchQuery = '';
    vm.filters = {
      status: 'all', // all, active, inactive
      sortBy: 'created_at', // created_at, name, email
      sortOrder: 'desc' // asc, desc
    };
    
    // Form de edição
    vm.editForm = {
      fullName: '',
      email: '',
      isActive: true,
      balance: 0,
      role: 'user'
    };
    
    // Métodos públicos
    vm.loadUsers = loadUsers;
    vm.viewUser = viewUser;
    vm.editUser = editUser;
    vm.saveUser = saveUser;
    vm.confirmDeleteUser = confirmDeleteUser;
    vm.deleteUser = deleteUser;
    vm.changePage = changePage;
    vm.resetFilters = resetFilters;
    vm.applyFilters = applyFilters;
    
    // Inicialização
    initialize();
    
    // Implementação
    function initialize() {
      loadUsers();
    }
    
    function loadUsers() {
      vm.isLoading = true;
      
      const params = {
        page: vm.currentPage,
        limit: vm.itemsPerPage,
        search: vm.searchQuery,
        status: vm.filters.status,
        sortBy: vm.filters.sortBy,
        sortOrder: vm.filters.sortOrder
      };
      
      UserService.getUsers(params)
        .then(function(response) {
          vm.users = response.data || [];
          vm.totalItems = response.meta?.total || vm.users.length;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar usuários: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao carregar usuários:', error);
        });
    }
    
    function viewUser(userId) {
      vm.isLoading = true;
      
      UserService.getUserById(userId)
        .then(function(response) {
          vm.selectedUser = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao carregar detalhes do usuário: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao carregar detalhes do usuário:', error);
        });
    }
    
    function editUser(user) {
      vm.editForm = {
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
        balance: user.balance,
        role: user.role || 'user'
      };
      
      vm.selectedUser = user;
      vm.showEditModal = true;
    }
    
    function saveUser() {
      vm.isLoading = true;
      
      UserService.updateUser(vm.selectedUser.id, vm.editForm)
        .then(function(response) {
          vm.success = 'Usuário atualizado com sucesso!';
          vm.showEditModal = false;
          
          // Atualizar usuário na lista
          const index = vm.users.findIndex(u => u.id === vm.selectedUser.id);
          if (index !== -1) {
            vm.users[index] = response;
          }
          
          vm.selectedUser = response;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao atualizar usuário: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          console.error('Erro ao atualizar usuário:', error);
        });
    }
    
    function confirmDeleteUser(user) {
      vm.selectedUser = user;
      vm.showDeleteModal = true;
    }
    
    function deleteUser() {
      vm.isLoading = true;
      
      UserService.deleteUser(vm.selectedUser.id)
        .then(function() {
          vm.success = 'Usuário excluído com sucesso!';
          vm.showDeleteModal = false;
          
          // Remover usuário da lista
          vm.users = vm.users.filter(u => u.id !== vm.selectedUser.id);
          vm.selectedUser = null;
          vm.isLoading = false;
        })
        .catch(function(error) {
          vm.error = 'Erro ao excluir usuário: ' + (error.message || 'Falha na requisição');
          vm.isLoading = false;
          vm.showDeleteModal = false;
          console.error('Erro ao excluir usuário:', error);
        });
    }
    
    function changePage(page) {
      vm.currentPage = page;
      loadUsers();
    }
    
    function resetFilters() {
      vm.searchQuery = '';
      vm.filters = {
        status: 'all',
        sortBy: 'created_at',
        sortOrder: 'desc'
      };
      
      vm.currentPage = 1;
      loadUsers();
    }
    
    function applyFilters() {
      vm.currentPage = 1;
      loadUsers();
    }
  }
]); 