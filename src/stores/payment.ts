import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PaymentGateway } from '../types/payment';
import axios from 'axios';
import { useAdminStore } from './admin';

// URL base da API
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const usePaymentStore = defineStore('payment', () => {
  // Estado
  const gateways = ref<PaymentGateway[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Store de admin para obter o token
  const adminStore = useAdminStore();

  // Getters
  const activeGateways = computed(() => gateways.value.filter(gateway => gateway.isActive));
  
  const depositGateways = computed(() => 
    activeGateways.value.filter(gateway => gateway.usageConfig.forDeposit)
  );
  
  const withdrawGateways = computed(() => 
    activeGateways.value.filter(gateway => gateway.usageConfig.forWithdraw)
  );

  // Configuração do axios com token de autenticação
  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${adminStore.adminToken}`
      }
    };
  };

  // Ações
  async function fetchGateways() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Inicializar gateways se necessário
      await axios.post(`${API_URL}/admin/payment-gateways/initialize`, {}, getAuthConfig());
      
      // Buscar gateways
      const response = await axios.get(`${API_URL}/admin/payment-gateways`, getAuthConfig());
      
      if (response.data.success) {
        gateways.value = response.data.data;
      } else {
        throw new Error('Falha ao buscar gateways de pagamento');
      }
      
      isLoading.value = false;
    } catch (err) {
      console.error('Erro ao buscar gateways:', err);
      error.value = 'Não foi possível carregar os gateways de pagamento.';
      isLoading.value = false;
    }
  }

  async function updateGateway(gateway: PaymentGateway) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.put(
        `${API_URL}/admin/payment-gateways/${gateway.id}`, 
        gateway, 
        getAuthConfig()
      );
      
      if (response.data.success) {
        // Atualiza o gateway na lista
        const index = gateways.value.findIndex(g => g.id === gateway.id);
        if (index !== -1) {
          gateways.value[index] = response.data.data;
        }
        
        isLoading.value = false;
        return true;
      } else {
        throw new Error('Falha ao atualizar gateway de pagamento');
      }
    } catch (err) {
      console.error('Erro ao atualizar gateway:', err);
      error.value = 'Não foi possível atualizar o gateway de pagamento.';
      isLoading.value = false;
      return false;
    }
  }

  async function toggleGatewayActive(gatewayId: string, active: boolean) {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.patch(
        `${API_URL}/admin/payment-gateways/${gatewayId}/toggle-active`, 
        {}, 
        getAuthConfig()
      );
      
      if (response.data.success) {
        // Atualiza o gateway na lista
        const index = gateways.value.findIndex(g => g.id === gatewayId);
        if (index !== -1) {
          gateways.value[index] = response.data.data;
        }
        
        isLoading.value = false;
        return true;
      } else {
        throw new Error('Falha ao atualizar estado do gateway');
      }
    } catch (err) {
      console.error('Erro ao atualizar estado do gateway:', err);
      error.value = 'Não foi possível atualizar o estado do gateway.';
      isLoading.value = false;
      return false;
    }
  }

  return {
    // Estado
    gateways,
    isLoading,
    error,
    
    // Getters
    activeGateways,
    depositGateways,
    withdrawGateways,
    
    // Ações
    fetchGateways,
    updateGateway,
    toggleGatewayActive
  };
}); 