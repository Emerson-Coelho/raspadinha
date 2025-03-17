import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';

// Interface para as configurações gerais
interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultCurrency: string;
  minDepositAmount: number;
  minWithdrawAmount: number;
  maxWithdrawAmount: number;
  withdrawProcessingTime: string;
  supportEmail: string;
  supportPhone: string;
}

export const useSettingsStore = defineStore('settings', () => {
  // Estado
  const generalSettings = reactive<GeneralSettings>({
    siteName: 'Raspadinha Online',
    siteDescription: 'Plataforma de jogos de raspadinha e números da sorte',
    maintenanceMode: false,
    maintenanceMessage: 'Estamos em manutenção. Voltaremos em breve!',
    defaultCurrency: 'BRL',
    minDepositAmount: 10,
    minWithdrawAmount: 20,
    maxWithdrawAmount: 5000,
    withdrawProcessingTime: '24 horas',
    supportEmail: 'suporte@raspadinha.com',
    supportPhone: '(11) 99999-9999'
  });
  
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Ações
  async function fetchSettings() {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Aqui seria feita uma chamada à API para buscar as configurações
      // Por enquanto, vamos simular um carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulação de dados carregados
      // Em um ambiente real, isso viria da API
      
      isLoading.value = false;
    } catch (err) {
      console.error('Erro ao buscar configurações:', err);
      error.value = 'Não foi possível carregar as configurações.';
      isLoading.value = false;
    }
  }

  async function updateSettings(settings: Partial<GeneralSettings>) {
    isLoading.value = true;
    error.value = null;
    
    try {
      // Aqui seria feita uma chamada à API para atualizar as configurações
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Atualiza as configurações
      Object.assign(generalSettings, settings);
      
      isLoading.value = false;
      return true;
    } catch (err) {
      console.error('Erro ao atualizar configurações:', err);
      error.value = 'Não foi possível atualizar as configurações.';
      isLoading.value = false;
      return false;
    }
  }

  return {
    // Estado
    generalSettings,
    isLoading,
    error,
    
    // Ações
    fetchSettings,
    updateSettings
  };
}); 