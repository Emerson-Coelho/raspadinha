import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

// Configuração do axios para usar a API local
axios.defaults.baseURL = 'http://localhost:3000/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  role: 'user' | 'admin' | 'moderator';
  balance: number;
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
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Estado computado
  const isAuthenticated = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'admin');
  const isModerator = computed(() => user.value?.role === 'moderator' || user.value?.role === 'admin');

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
      const response = await axios.post('/auth/login', credentials);
      
      token.value = response.data.token;
      user.value = response.data.user;
      
      // Salva o token no localStorage
      localStorage.setItem('token', response.data.token);
      
      return true;
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
      const response = await axios.post('/auth/register', data);
      return true;
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
      // Configurar o cabeçalho de autorização
      const config = {
        headers: { Authorization: `Bearer ${token.value}` }
      };
      
      const response = await axios.get('/auth/profile', config);
      user.value = response.data.user;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response && err.response.status === 401) {
        // Token inválido ou expirado
        logout();
      }
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    isModerator,
    initialize,
    login,
    register,
    fetchUserProfile,
    logout
  };
}); 