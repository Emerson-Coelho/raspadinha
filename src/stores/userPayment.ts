import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PaymentGateway } from '../types/payment';
import axios from 'axios';
import { useAuthStore } from './auth';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || '/api';

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
    if (paymentMethod === 'pix' && !selectedGateway.value.paymentMethods.allowPix) {
      error.value = 'Este gateway não permite pagamentos via PIX.';
      return false;
    }
    
    if (paymentMethod === 'card' && !selectedGateway.value.paymentMethods.allowCard) {
      error.value = 'Este gateway não permite pagamentos via cartão.';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Simulação de processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (paymentMethod === 'pix') {
        // Simulação de geração de QR Code e código PIX
        qrCodeUrl.value = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028-f142a1dd04b5520400005303986540' + amount + '5802BR5913Raspadinha SA6008Sao Paulo62070503***63041D14';
        pixCode.value = '00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028-f142a1dd04b5520400005303986540' + amount + '5802BR5913Raspadinha SA6008Sao Paulo62070503***63041D14';
        
        showSuccessMessage.value = true;
      } else {
        // Simulação de processamento de cartão
        // Na implementação real, você chamaria a API do gateway de pagamento
        
        // Atualizar saldo do usuário (simulação)
        if (authStore.user) {
          authStore.user.balance += amount;
        }
        
        ElMessage.success('Depósito realizado com sucesso!');
        showSuccessMessage.value = false;
        
        // Redirecionar para a tela de raspadinha
        router.push('/games/scratch-card');
      }
      
      isLoading.value = false;
      return true;
    } catch (err) {
      console.error('Erro ao processar depósito:', err);
      error.value = 'Não foi possível processar o depósito. Tente novamente.';
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
    
    const { amount, method } = withdrawData;
    
    // Verificar se o método de pagamento é suportado pelo gateway
    if (method === 'pix' && !selectedGateway.value.paymentMethods.allowPix) {
      error.value = 'Este gateway não permite saques via PIX.';
      return false;
    }
    
    if (method === 'card' && !selectedGateway.value.paymentMethods.allowCard) {
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
      // Simulação de processamento de saque
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Atualizar saldo do usuário (simulação)
      if (authStore.user) {
        authStore.user.balance -= amount;
      }
      
      showSuccessMessage.value = true;
      isLoading.value = false;
      return true;
    } catch (err) {
      console.error('Erro ao processar saque:', err);
      error.value = 'Não foi possível processar o saque. Tente novamente.';
      isLoading.value = false;
      return false;
    }
  }
  
  // Verificar depósito (simulação)
  async function checkDepositStatus() {
    // Simulação de verificação de depósito
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Atualizar saldo do usuário (simulação)
    if (authStore.user) {
      authStore.user.balance += 100; // Valor fixo para simulação
    }
    
    ElMessage.success('Depósito confirmado com sucesso!');
    showSuccessMessage.value = false;
    
    // Redirecionar para a tela de raspadinha
    router.push('/games/scratch-card');
    
    return true;
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