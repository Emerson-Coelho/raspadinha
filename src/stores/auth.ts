import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Criar uma instância separada do Axios para usuários jogadores
const userAxios = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true // Habilitar cookies para o token de atualização
});

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: 'user' | 'vip';
  balance: number;
  status: 'active' | 'inactive' | 'suspended';
  partnerId?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Estado computado
  const isAuthenticated = computed(() => !!token.value);
  const isVip = computed(() => user.value?.role === 'vip');

  // Configurar interceptor para adicionar token de autorização
  userAxios.interceptors.request.use(
    (config) => {
      if (token.value) {
        config.headers.Authorization = `Bearer ${token.value}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor para lidar com erros de autenticação
  userAxios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Se o erro for 401 (não autorizado) e não for uma tentativa de atualizar o token
      if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('refresh-token')) {
        originalRequest._retry = true;
        
        try {
          // Tentar atualizar o token
          const response = await userAxios.post('/auth/refresh-token');
          const newToken = response.data.token;
          
          if (newToken) {
            // Atualizar o token no store e localStorage
            token.value = newToken;
            localStorage.setItem('token', newToken);
            
            // Reenviar a requisição original com o novo token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return userAxios(originalRequest);
          }
        } catch (refreshError) {
          // Se falhar ao atualizar o token, fazer logout
          logout();
          
          // Redirecionar para a página de login
          router.push({ 
            name: 'login', 
            query: { 
              redirect: router.currentRoute.value.fullPath,
              reason: 'session_expired'
            } 
          });
          
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );

  // Ações
  async function initialize() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
      await fetchUserProfile();
    }
  }

  async function login(credentials: LoginCredentials) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await userAxios.post('/auth/login', credentials);
      
      if (response.data.success) {
        token.value = response.data.token;
        user.value = response.data.user;
        
        // Salva o token no localStorage
        localStorage.setItem('token', response.data.token);
        
        return true;
      } else {
        error.value = response.data.message || 'Erro ao fazer login';
        return false;
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao fazer login';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(data: RegisterData) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await userAxios.post('/auth/register', data);
      
      if (response.data.success) {
        return true;
      } else {
        error.value = response.data.message || 'Erro ao registrar';
        return false;
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao registrar';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserProfile() {
    if (!token.value) return;
    
    isLoading.value = true;
    
    try {
      const response = await userAxios.get('/auth/profile');
      
      if (response.data.success) {
        user.value = response.data.user;
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        // Token inválido ou expirado e não foi possível atualizar
        logout();
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function logout() {
    if (token.value) {
      try {
        // Chamar a API para invalidar o token no servidor
        await userAxios.get('/auth/logout');
      } catch (err) {
        // Ignorar erros ao fazer logout
      }
    }
    
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  // Função para renovar o token
  async function refreshToken() {
    try {
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const newToken = response.data.token;
        token.value = newToken;
        localStorage.setItem('token', newToken);
        return newToken;
      } else {
        throw new Error('Falha ao renovar o token');
      }
    } catch (err) {
      console.error('Erro ao renovar token:', err);
      logout();
      return null;
    }
  }

  // Verificar se o token está expirado
  function isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Converter para milissegundos
      return Date.now() >= expiryTime;
    } catch (e) {
      console.error('Erro ao verificar expiração do token:', e);
      return true;
    }
  }

  // Obter token válido (renovar se necessário)
  async function getValidToken(): Promise<string | null> {
    const currentToken = token.value || localStorage.getItem('token');
    
    if (!currentToken) {
      return null;
    }
    
    if (isTokenExpired(currentToken)) {
      console.log('Token expirado, tentando renovar...');
      return await refreshToken();
    }
    
    return currentToken;
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isVip,
    initialize,
    login,
    register,
    fetchUserProfile,
    logout,
    refreshToken,
    isTokenExpired,
    getValidToken
  };
}); 