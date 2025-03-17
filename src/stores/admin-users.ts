import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAdminStore } from './admin';

// URL base da API - remover a barra no final se existir
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

// Criar uma instância separada do Axios para administração
const adminAxios = axios.create({
  baseURL: API_URL
});

// Função para construir URLs da API corretamente
const buildApiUrl = (path: string) => {
  // Garantir que o path comece com '/'
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
};

interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  balance: number;
  role: 'user' | 'vip';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFilters {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  role?: string;
  status?: string;
  minBalance?: number;
  maxBalance?: number;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

interface PaginationParams {
  page: number;
  limit: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

export const useAdminUsersStore = defineStore('adminUsers', () => {
  // Obter o store de administração
  const adminStore = useAdminStore();
  
  // Configurar interceptor para adicionar token de autorização
  adminAxios.interceptors.request.use(
    (config) => {
      if (adminStore.adminToken) {
        config.headers.Authorization = `Bearer ${adminStore.adminToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Estado
  const users = ref<User[]>([]);
  const selectedUser = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const totalUsers = ref(0);
  const totalPages = ref(0);
  const currentPage = ref(1);

  // Filtros e paginação
  const filters = ref<UserFilters>({});
  const pagination = ref<PaginationParams>({
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc'
  });

  // Getters
  const hasUsers = computed(() => users.value.length > 0);
  const hasFilters = computed(() => Object.keys(filters.value).length > 0);

  // Ações
  async function fetchUsers() {
    isLoading.value = true;
    error.value = null;

    try {
      // Construir parâmetros de consulta
      const params = new URLSearchParams();
      
      // Adicionar parâmetros de paginação
      params.append('page', pagination.value.page.toString());
      params.append('limit', pagination.value.limit.toString());
      params.append('sortField', pagination.value.sortField);
      params.append('sortOrder', pagination.value.sortOrder);
      
      // Adicionar filtros
      Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Verificar se o token existe
      if (!adminStore.adminToken) {
        console.error('Token de administrador não encontrado');
        error.value = 'Token de administrador não encontrado. Por favor, faça login novamente.';
        return;
      }

      console.log('Buscando usuários com token de administrador');

      const response = await adminAxios.get('/admin/users', { params });
      
      if (response.data.success) {
        users.value = response.data.users;
        totalUsers.value = response.data.count;
        totalPages.value = response.data.totalPages;
        currentPage.value = response.data.currentPage;
      } else {
        error.value = response.data.message || 'Erro ao buscar usuários';
      }
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.error || err.response.data.message || 'Erro ao buscar usuários';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserById(id: string) {
    isLoading.value = true;
    error.value = null;

    try {
      // Verificar se o token existe
      if (!adminStore.adminToken) {
        console.error('Token de administrador não encontrado');
        error.value = 'Token de administrador não encontrado. Por favor, faça login novamente.';
        return false;
      }

      const response = await adminAxios.get(`/admin/users/${id}`);
      
      if (response.data.success) {
        selectedUser.value = response.data.user;
        return true;
      } else {
        error.value = response.data.message || 'Erro ao buscar usuário';
        return false;
      }
    } catch (err) {
      console.error('Erro ao buscar usuário:', err);
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.error || err.response.data.message || 'Erro ao buscar usuário';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: string, userData: Partial<User>) {
    isLoading.value = true;
    error.value = null;

    try {
      // Verificar se o token existe
      if (!adminStore.adminToken) {
        console.error('Token de administrador não encontrado');
        error.value = 'Token de administrador não encontrado. Por favor, faça login novamente.';
        return false;
      }

      const response = await adminAxios.put(`/admin/users/${id}`, userData);
      
      if (response.data.success) {
        // Atualizar o usuário na lista
        const index = users.value.findIndex(u => u.id === id);
        if (index !== -1) {
          users.value[index] = response.data.user;
        }
        
        // Atualizar o usuário selecionado se for o mesmo
        if (selectedUser.value && selectedUser.value.id === id) {
          selectedUser.value = response.data.user;
        }
        
        return true;
      } else {
        error.value = response.data.message || 'Erro ao atualizar usuário';
        return false;
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.error || err.response.data.message || 'Erro ao atualizar usuário';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: string) {
    isLoading.value = true;
    error.value = null;

    try {
      // Verificar se o token existe
      if (!adminStore.adminToken) {
        console.error('Token de administrador não encontrado');
        error.value = 'Token de administrador não encontrado. Por favor, faça login novamente.';
        return false;
      }

      const response = await adminAxios.delete(`/admin/users/${id}`);
      
      if (response.data.success) {
        // Remover o usuário da lista
        users.value = users.value.filter(u => u.id !== id);
        
        // Limpar o usuário selecionado se for o mesmo
        if (selectedUser.value && selectedUser.value.id === id) {
          selectedUser.value = null;
        }
        
        return true;
      } else {
        error.value = response.data.message || 'Erro ao excluir usuário';
        return false;
      }
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.error || err.response.data.message || 'Erro ao excluir usuário';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function changeUserPassword(id: string, newPassword: string) {
    isLoading.value = true;
    error.value = null;

    try {
      // Verificar se o token existe
      if (!adminStore.adminToken) {
        console.error('Token de administrador não encontrado');
        error.value = 'Token de administrador não encontrado. Por favor, faça login novamente.';
        return false;
      }

      const response = await adminAxios.put(`/admin/users/${id}/change-password`, { newPassword });
      
      if (response.data.success) {
        return true;
      } else {
        error.value = response.data.message || 'Erro ao alterar senha';
        return false;
      }
    } catch (err) {
      console.error('Erro ao alterar senha:', err);
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.error || err.response.data.message || 'Erro ao alterar senha';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  function setPage(page: number) {
    pagination.value.page = page;
    fetchUsers();
  }

  function setLimit(limit: number) {
    pagination.value.limit = limit;
    pagination.value.page = 1; // Resetar para a primeira página
    fetchUsers();
  }

  function setSorting(field: string, order: 'asc' | 'desc' = 'asc') {
    pagination.value.sortField = field;
    pagination.value.sortOrder = order;
    fetchUsers();
  }

  function setFilters(newFilters: UserFilters) {
    filters.value = { ...newFilters };
    pagination.value.page = 1; // Resetar para a primeira página
    fetchUsers();
  }

  function clearFilters() {
    filters.value = {};
    fetchUsers();
  }

  return {
    // Estado
    users,
    selectedUser,
    isLoading,
    error,
    totalUsers,
    totalPages,
    currentPage,
    filters,
    pagination,
    
    // Getters
    hasUsers,
    hasFilters,
    
    // Ações
    fetchUsers,
    fetchUserById,
    updateUser,
    deleteUser,
    changeUserPassword,
    setPage,
    setLimit,
    setSorting,
    setFilters,
    clearFilters
  };
}); 