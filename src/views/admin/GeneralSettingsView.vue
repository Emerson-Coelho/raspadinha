<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSettingsStore } from '../../stores/settings';

// Store de configurações
const settingsStore = useSettingsStore();

// Estado de carregamento
const isSaving = ref(false);

// Mensagens de feedback
const successMessage = ref('');
const errorMessage = ref('');

// Computed properties
const generalSettings = computed(() => settingsStore.generalSettings);
const isLoading = computed(() => settingsStore.isLoading);

// Observar erros da store
watch(() => settingsStore.error, (newError) => {
  if (newError) {
    errorMessage.value = newError;
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
});

// Salvar configurações
async function saveSettings() {
  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    const success = await settingsStore.updateSettings(generalSettings.value);
    
    if (success) {
      successMessage.value = 'Configurações salvas com sucesso!';
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      errorMessage.value = 'Não foi possível salvar as configurações.';
    }
    
    isSaving.value = false;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    errorMessage.value = 'Não foi possível salvar as configurações.';
    isSaving.value = false;
  }
}

// Carregar configurações ao montar o componente
onMounted(() => {
  settingsStore.fetchSettings();
});
</script>

<template>
  <div>
    <!-- Mensagens de feedback -->
    <div v-if="successMessage" class="mb-4 p-4 bg-green-800 text-green-100 rounded-md">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mb-4 p-4 bg-red-800 text-red-100 rounded-md">
      {{ errorMessage }}
    </div>

    <!-- Cabeçalho da seção -->
    <div class="mb-6">
      <h2 class="text-2xl font-semibold text-white">Configurações Gerais</h2>
      <p class="text-gray-400 mt-1">Configure as opções gerais do sistema</p>
    </div>

    <!-- Formulário de configurações -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>

    <form v-else @submit.prevent="saveSettings" class="space-y-8">
      <!-- Informações do Site -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Informações do Site</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="siteName" class="block text-sm font-medium text-gray-300 mb-1">
              Nome do Site
            </label>
            <input
              id="siteName"
              v-model="generalSettings.siteName"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="siteDescription" class="block text-sm font-medium text-gray-300 mb-1">
              Descrição do Site
            </label>
            <input
              id="siteDescription"
              v-model="generalSettings.siteDescription"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="supportEmail" class="block text-sm font-medium text-gray-300 mb-1">
              Email de Suporte
            </label>
            <input
              id="supportEmail"
              v-model="generalSettings.supportEmail"
              type="email"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="supportPhone" class="block text-sm font-medium text-gray-300 mb-1">
              Telefone de Suporte
            </label>
            <input
              id="supportPhone"
              v-model="generalSettings.supportPhone"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <!-- Modo de Manutenção -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Modo de Manutenção</h3>
        
        <div class="space-y-4">
          <div class="flex items-center">
            <input
              id="maintenanceMode"
              v-model="generalSettings.maintenanceMode"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
            />
            <label for="maintenanceMode" class="ml-2 block text-sm text-gray-300">
              Ativar Modo de Manutenção
            </label>
          </div>
          
          <div v-if="generalSettings.maintenanceMode">
            <label for="maintenanceMessage" class="block text-sm font-medium text-gray-300 mb-1">
              Mensagem de Manutenção
            </label>
            <textarea
              id="maintenanceMessage"
              v-model="generalSettings.maintenanceMessage"
              rows="3"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
        </div>
      </div>
      
      <!-- Configurações Financeiras -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-lg font-medium text-white mb-4">Configurações Financeiras</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="defaultCurrency" class="block text-sm font-medium text-gray-300 mb-1">
              Moeda Padrão
            </label>
            <select
              id="defaultCurrency"
              v-model="generalSettings.defaultCurrency"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="BRL">Real Brasileiro (BRL)</option>
              <option value="USD">Dólar Americano (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          
          <div>
            <label for="minDepositAmount" class="block text-sm font-medium text-gray-300 mb-1">
              Valor Mínimo de Depósito
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">R$</span>
              </div>
              <input
                id="minDepositAmount"
                v-model="generalSettings.minDepositAmount"
                type="number"
                min="0"
                step="1"
                class="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="minWithdrawAmount" class="block text-sm font-medium text-gray-300 mb-1">
              Valor Mínimo de Saque
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">R$</span>
              </div>
              <input
                id="minWithdrawAmount"
                v-model="generalSettings.minWithdrawAmount"
                type="number"
                min="0"
                step="1"
                class="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="maxWithdrawAmount" class="block text-sm font-medium text-gray-300 mb-1">
              Valor Máximo de Saque
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">R$</span>
              </div>
              <input
                id="maxWithdrawAmount"
                v-model="generalSettings.maxWithdrawAmount"
                type="number"
                min="0"
                step="1"
                class="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="withdrawProcessingTime" class="block text-sm font-medium text-gray-300 mb-1">
              Tempo de Processamento de Saque
            </label>
            <input
              id="withdrawProcessingTime"
              v-model="generalSettings.withdrawProcessingTime"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <!-- Botões de ação -->
      <div class="flex justify-end">
        <button
          type="submit"
          class="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors flex items-center"
          :disabled="isSaving"
        >
          <svg 
            v-if="isSaving" 
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isSaving ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GeneralSettingsView'
}
</script> 