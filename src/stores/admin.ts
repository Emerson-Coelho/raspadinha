import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

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

// Debug
console.log("API_URL configurada:", API_URL);

interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
}

interface AdminLoginCredentials {
  email: string;
  password: string;
}

export const useAdminStore = defineStore('admin', () => {
  const router = useRouter();
  const admin = ref<Admin | null>(null);
  const adminToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Estado computado
  const isAdminAuthenticated = computed(() => !!adminToken.value);
  const isSuperAdmin = computed(() => admin.value?.role === 'super_admin');

  // Configurar interceptor para adicionar token de autorização
  adminAxios.interceptors.request.use(
    (config) => {
      if (adminToken.value) {
        config.headers.Authorization = `Bearer ${adminToken.value}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para lidar com erros de autenticação
  adminAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Token inválido ou expirado
        adminLogout();
        
        // Redirecionar para a página de login admin
        if (router.currentRoute.value.meta.requiresAdmin) {
          router.push({ 
            name: 'admin-login', 
            query: { 
              redirect: router.currentRoute.value.fullPath,
              reason: 'session_expired'
            } 
          });
        }
      }
      return Promise.reject(error);
    }
  );

  // Ações
  async function initialize() {
    console.log('Inicializando store de administração');
    const storedToken = localStorage.getItem('admin_token');
    
    if (storedToken) {
      console.log('Token encontrado no localStorage:', storedToken.substring(0, 20) + '...');
      adminToken.value = storedToken;
      
      try {
        // Verificar se o token é válido
        const isValid = await verifyToken();
        console.log('Token válido?', isValid);
        
        if (!isValid) {
          console.log('Token inválido, fazendo logout');
          adminLogout();
        }
      } catch (err) {
        // Se ocorrer um erro ao verificar o token, limpar o token
        console.error('Erro ao verificar token durante inicialização:', err);
        adminLogout();
      }
    } else {
      console.log('Nenhum token encontrado no localStorage');
    }
  }

  async function verifyToken() {
    if (!adminToken.value) {
      console.log('Nenhum token disponível para verificar');
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Verificando token:', adminToken.value);
      
      const response = await adminAxios.get('/admin/verify-token');
      console.log('Resposta da verificação do token:', response.data);
      
      if (response.data.success) {
        admin.value = response.data.admin;
        return true;
      }
      
      return false;
    } catch (err) {
      console.error('Erro ao verificar token:', err);
      
      if (axios.isAxiosError(err)) {
        console.log('Detalhes do erro Axios:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          headers: err.response?.headers,
          config: err.config
        });
        
        if (err.response?.status === 401) {
          // Token inválido ou expirado
          adminLogout();
          error.value = 'Sua sessão expirou. Por favor, faça login novamente.';
        } else if (err.response) {
          error.value = err.response.data.error || err.response.data.message || 'Erro ao verificar token';
        } else {
          error.value = 'Erro ao conectar com o servidor';
        }
      } else {
        error.value = 'Erro desconhecido';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function adminLogin(credentials: AdminLoginCredentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      console.log('Tentando fazer login com:', credentials.email);
      const response = await adminAxios.post('/admin/login', credentials);
      
      console.log('Resposta do login:', response.data);
      
      if (response.data.success && response.data.token) {
        adminToken.value = response.data.token;
        admin.value = response.data.admin;
        
        // Salva o token no localStorage
        localStorage.setItem('admin_token', response.data.token);
        
        console.log('Token armazenado com sucesso:', response.data.token.substring(0, 20) + '...');
        
        return true;
      } else {
        error.value = 'Resposta inválida do servidor';
        return false;
      }
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.error || err.response.data.message || 'Erro ao fazer login administrativo';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAdminProfile() {
    if (!adminToken.value) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await adminAxios.get('/admin/profile');
      admin.value = response.data.admin;
      return true;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          // Token inválido ou expirado
          adminLogout();
          error.value = 'Sua sessão expirou. Por favor, faça login novamente.';
        } else if (err.response) {
          error.value = err.response.data.message || 'Erro ao buscar perfil de administrador';
        } else {
          error.value = 'Erro ao conectar com o servidor';
        }
      } else {
        error.value = 'Erro desconhecido';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function adminLogout() {
    console.log('Fazendo logout administrativo');
    admin.value = null;
    adminToken.value = null;
    localStorage.removeItem('admin_token');
    console.log('Token removido do localStorage');
  }

  return {
    admin,
    adminToken,
    isLoading,
    error,
    isAdminAuthenticated,
    isSuperAdmin,
    initialize,
    adminLogin,
    fetchAdminProfile,
    verifyToken,
    adminLogout
  };
}); 