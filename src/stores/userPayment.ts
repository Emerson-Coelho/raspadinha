import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PaymentGateway } from '../types/payment';
import axios from 'axios';
import { useAuthStore } from './auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// URL base da API - remover a barra no final se existir
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

export const useUserPaymentStore = defineStore('userPayment', () => {
  // Estado
  const availableGateways = ref<PaymentGateway[]>([]);
  const selectedGateway = ref<PaymentGateway | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const qrCodeUrl = ref('');
  const pixCode = ref('');
  const showSuccessMessage = ref(false);
  
  // Router para navegação
  const router = useRouter();
  
  // Store de autenticação para obter o token e dados do usuário
  const authStore = useAuthStore();
  
  // Getters
  const depositGateways = computed(() => 
    availableGateways.value.filter(gateway => 
      gateway.isActive && gateway.usageConfig.forDeposit
    )
  );
  
  const withdrawGateways = computed(() => 
    availableGateways.value.filter(gateway => 
      gateway.isActive && gateway.usageConfig.forWithdraw
    )
  );
  
  const hasMultipleDepositGateways = computed(() => depositGateways.value.length > 1);
  const hasMultipleWithdrawGateways = computed(() => withdrawGateways.value.length > 1);
  
  // Configuração do axios com token de autenticação
  const getAuthConfig = () => {
    const token = authStore.token;
    const storedToken = localStorage.getItem('token');
    
    console.log('Token da store:', token);
    console.log('Token do localStorage:', storedToken);
    
    if (!token) {
      console.error('Token de autenticação não encontrado');
      throw new Error('Usuário não autenticado');
    }
    
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Função para construir URLs da API corretamente
  const buildApiUrl = (path: string) => {
    // Garantir que o path comece com '/'
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_URL}${normalizedPath}`;
  };
  
  // Ações
  async function fetchAvailableGateways() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obter token válido (renovado se necessário)
      const token = await authStore.getValidToken();
      
      if (!token) {
        error.value = 'Usuário não autenticado. Faça login novamente.';
        isLoading.value = false;
        return;
      }
      
      // Configurar instância do axios com o token
      const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Auth-Token': token
        },
        withCredentials: true
      });
      
      // Buscar gateways ativos diretamente
      const response = await axiosInstance.get('/payment-gateways/active-direct-auth');
      
      if (response.data.success) {
        availableGateways.value = response.data.data;
        
        // Se houver apenas um gateway para depósito ou saque, selecioná-lo automaticamente
        if (depositGateways.value.length === 1) {
          selectedGateway.value = depositGateways.value[0];
        }
        
        if (withdrawGateways.value.length === 1) {
          selectedGateway.value = withdrawGateways.value[0];
        }
      } else {
        throw new Error('Falha ao buscar gateways de pagamento');
      }
      
      isLoading.value = false;
    } catch (err: any) {
      // Se o erro for de token expirado, tentar renovar o token e tentar novamente
      if (err.response?.data?.error === 'jwt expired') {
        const newToken = await authStore.refreshToken();
        
        if (newToken) {
          // Tentar novamente com o novo token
          return fetchAvailableGateways();
        } else {
          error.value = 'Sessão expirada. Faça login novamente.';
        }
      } else {
        error.value = 'Não foi possível carregar os gateways de pagamento: ' + (err.response?.data?.message || err.message);
      }
      
      isLoading.value = false;
    }
  }
  
  // Selecionar um gateway
  function selectGateway(gateway: PaymentGateway) {
    selectedGateway.value = gateway;
  }
  
  // Processar depósito
  async function processDeposit(amount: number, paymentMethod: 'pix' | 'card') {
    if (!selectedGateway.value) {
      error.value = 'Nenhum gateway de pagamento selecionado.';
      return false;
    }
    
    // Verificar se o método de pagamento é permitido
    const isPixAllowed = selectedGateway.value.paymentMethods?.allowPix ?? 
                         selectedGateway.value.allowPix ?? 
                         true;
    
    const isCardAllowed = selectedGateway.value.paymentMethods?.allowCard ?? 
                          selectedGateway.value.allowCard ?? 
                          true;
    
    if (paymentMethod === 'pix' && !isPixAllowed) {
      error.value = 'Este gateway não permite pagamentos via PIX.';
      return false;
    }
    
    if (paymentMethod === 'card' && !isCardAllowed) {
      error.value = 'Este gateway não permite pagamentos via cartão.';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obter token válido
      const token = await authStore.getValidToken();
      
      if (!token) {
        error.value = 'Usuário não autenticado. Faça login novamente.';
        isLoading.value = false;
        return false;
      }
      
      // Configurar instância do axios com o token
      const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      // Chamar a API para criar uma transação de depósito
      const response = await axiosInstance.post('/transactions/deposit', {
        amount,
        paymentMethod,
        gatewayId: selectedGateway.value.id
      });
      
      if (response.data.success) {
        if (paymentMethod === 'pix') {
          // Armazenar dados do PIX retornados pela API
          qrCodeUrl.value = response.data.qrCodeUrl || '';
          pixCode.value = response.data.pixCode || '';
          showSuccessMessage.value = true;
        } else if (paymentMethod === 'card') {
          // Redirecionar para a página de pagamento do UnifyPay
          if (response.data.redirectUrl) {
            window.location.href = response.data.redirectUrl;
          } else {
            // Atualizar saldo do usuário (caso o pagamento seja processado imediatamente)
            if (authStore.user && response.data.status === 'completed') {
              authStore.user.balance += amount;
              ElMessage.success('Depósito realizado com sucesso!');
              router.push('/games/scratch-card');
            } else {
              showSuccessMessage.value = true;
            }
          }
        }
        
        isLoading.value = false;
        return true;
      } else {
        throw new Error(response.data.message || 'Falha ao processar depósito');
      }
    } catch (err: any) {
      console.error('Erro ao processar depósito:', err);
      error.value = 'Não foi possível processar o depósito: ' + (err.response?.data?.message || err.message);
      isLoading.value = false;
      return false;
    }
  }
  
  // Processar saque
  async function processWithdraw(withdrawData: {
    amount: number;
    method: 'pix' | 'card';
    pixKey?: string;
    pixKeyType?: string;
    cardNumber?: string;
    cardName?: string;
    cardBank?: string;
  }) {
    if (!selectedGateway.value) {
      error.value = 'Nenhum gateway de pagamento selecionado.';
      return false;
    }
    
    const { amount, method, pixKey, pixKeyType, cardNumber, cardName, cardBank } = withdrawData;
    
    // Verificar se o método de pagamento é suportado pelo gateway
    const isPixAllowed = selectedGateway.value.paymentMethods?.allowPix ?? 
                         selectedGateway.value.allowPix ?? 
                         true;
    
    const isCardAllowed = selectedGateway.value.paymentMethods?.allowCard ?? 
                          selectedGateway.value.allowCard ?? 
                          true;
    
    if (method === 'pix' && !isPixAllowed) {
      error.value = 'Este gateway não permite saques via PIX.';
      return false;
    }
    
    if (method === 'card' && !isCardAllowed) {
      error.value = 'Este gateway não permite saques via cartão.';
      return false;
    }
    
    // Verificar saldo
    if (!authStore.user || authStore.user.balance < amount) {
      error.value = 'Saldo insuficiente para realizar este saque.';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obter token válido
      const token = await authStore.getValidToken();
      
      if (!token) {
        error.value = 'Usuário não autenticado. Faça login novamente.';
        isLoading.value = false;
        return false;
      }
      
      // Configurar instância do axios com o token
      const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      // Preparar dados para a API
      const withdrawPayload: any = {
        amount,
        paymentMethod: method,
        gatewayId: selectedGateway.value.id
      };
      
      // Adicionar dados específicos do método de pagamento
      if (method === 'pix' && pixKey && pixKeyType) {
        withdrawPayload.pixKey = pixKey;
        withdrawPayload.pixKeyType = pixKeyType;
      } else if (method === 'card' && cardNumber && cardName && cardBank) {
        withdrawPayload.cardNumber = cardNumber;
        withdrawPayload.cardName = cardName;
        withdrawPayload.cardBank = cardBank;
      }
      
      // Chamar a API para criar uma transação de saque
      const response = await axiosInstance.post('/transactions/withdraw', withdrawPayload);
      
      if (response.data.success) {
        // Atualizar saldo do usuário
        if (authStore.user) {
          authStore.user.balance -= amount;
        }
        
        showSuccessMessage.value = true;
        isLoading.value = false;
        return true;
      } else {
        throw new Error(response.data.message || 'Falha ao processar saque');
      }
    } catch (err: any) {
      console.error('Erro ao processar saque:', err);
      error.value = 'Não foi possível processar o saque: ' + (err.response?.data?.message || err.message);
      isLoading.value = false;
      return false;
    }
  }
  
  // Verificar status do depósito
  async function checkDepositStatus(transactionId?: string) {
    isLoading.value = true;
    
    try {
      // Obter token válido
      const token = await authStore.getValidToken();
      
      if (!token) {
        error.value = 'Usuário não autenticado. Faça login novamente.';
        isLoading.value = false;
        return false;
      }
      
      // Configurar instância do axios com o token
      const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
      
      // Chamar a API para verificar o status da transação
      const response = await axiosInstance.get(`/transactions/status${transactionId ? `/${transactionId}` : ''}`);
      
      if (response.data.success && response.data.status === 'completed') {
        // Atualizar saldo do usuário
        if (authStore.user && response.data.amount) {
          authStore.user.balance += parseFloat(response.data.amount);
        }
        
        ElMessage.success('Depósito confirmado com sucesso!');
        showSuccessMessage.value = false;
        
        // Redirecionar para a tela de raspadinha
        router.push('/games/scratch-card');
        
        isLoading.value = false;
        return true;
      } else if (response.data.status === 'pending') {
        ElMessage.info('Seu pagamento ainda está sendo processado. Tente novamente em alguns instantes.');
        isLoading.value = false;
        return false;
      } else {
        throw new Error(response.data.message || 'Falha ao verificar status do depósito');
      }
    } catch (err: any) {
      console.error('Erro ao verificar status do depósito:', err);
      error.value = 'Não foi possível verificar o status do depósito: ' + (err.response?.data?.message || err.message);
      isLoading.value = false;
      return false;
    }
  }
  
  // Resetar estado
  function resetState() {
    selectedGateway.value = null;
    qrCodeUrl.value = '';
    pixCode.value = '';
    showSuccessMessage.value = false;
    error.value = null;
  }
  
  return {
    // Estado
    availableGateways,
    selectedGateway,
    isLoading,
    error,
    qrCodeUrl,
    pixCode,
    showSuccessMessage,
    
    // Getters
    depositGateways,
    withdrawGateways,
    hasMultipleDepositGateways,
    hasMultipleWithdrawGateways,
    
    // Ações
    fetchAvailableGateways,
    selectGateway,
    processDeposit,
    processWithdraw,
    checkDepositStatus,
    resetState
  };
}); 