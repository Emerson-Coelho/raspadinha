<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { PaymentGateway } from '../../types/payment';
import { usePaymentStore } from '../../stores/payment';
import { useAdminStore } from '../../stores/admin';

// Store de pagamento
const paymentStore = usePaymentStore();
// Store de admin para verificar se é super_admin
const adminStore = useAdminStore();

// Gateway em edição
const editingGateway = ref<PaymentGateway | null>(null);

// Mensagens de feedback
const successMessage = ref('');
const errorMessage = ref('');
const isSaving = ref(false);

// Computed properties
const gateways = computed(() => paymentStore.gateways);
const isLoading = computed(() => paymentStore.isLoading);
const isSuperAdmin = computed(() => adminStore.admin?.role === 'super_admin');

// Observar erros da store
watch(() => paymentStore.error, (newError) => {
  if (newError) {
    errorMessage.value = newError;
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
});

// Editar um gateway
function editGateway(gateway: PaymentGateway) {
  // Cria uma cópia profunda para não modificar o original diretamente
  editingGateway.value = JSON.parse(JSON.stringify(gateway));
}

// Cancelar edição
function cancelEdit() {
  editingGateway.value = null;
}

// Salvar configurações do gateway
async function saveGatewaySettings() {
  if (!editingGateway.value) return;
  
  isSaving.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    const success = await paymentStore.updateGateway(editingGateway.value);
    
    if (success) {
      successMessage.value = 'Configurações salvas com sucesso!';
      editingGateway.value = null;
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      errorMessage.value = 'Não foi possível salvar as configurações do gateway.';
    }
    
    isSaving.value = false;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    errorMessage.value = 'Não foi possível salvar as configurações do gateway.';
    isSaving.value = false;
  }
}

// Alternar estado ativo do gateway
async function toggleGatewayActive(gateway: PaymentGateway) {
  try {
    const success = await paymentStore.toggleGatewayActive(gateway.id, !gateway.isActive);
    
    if (success) {
      successMessage.value = `Gateway ${!gateway.isActive ? 'ativado' : 'desativado'} com sucesso!`;
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      errorMessage.value = 'Não foi possível atualizar o estado do gateway.';
      
      // Limpar mensagem de erro após 5 segundos
      setTimeout(() => {
        errorMessage.value = '';
      }, 5000);
    }
  } catch (error) {
    console.error('Erro ao atualizar estado do gateway:', error);
    errorMessage.value = 'Não foi possível atualizar o estado do gateway.';
    
    // Limpar mensagem de erro após 5 segundos
    setTimeout(() => {
      errorMessage.value = '';
    }, 5000);
  }
}

// Carregar configurações ao montar o componente
onMounted(() => {
  paymentStore.fetchGateways();
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
      <h2 class="text-2xl font-semibold text-white">Gateways de Pagamento</h2>
      <p class="text-gray-400 mt-1">Configure os gateways de pagamento para depósitos e saques</p>
    </div>

    <!-- Lista de gateways -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Card para cada gateway -->
      <div 
        v-for="gateway in gateways" 
        :key="gateway.id"
        class="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
      >
        <!-- Cabeçalho do card -->
        <div class="p-6 flex items-start justify-between">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
              <img 
                v-if="gateway.logo" 
                :src="gateway.logo" 
                :alt="gateway.name" 
                class="max-w-full max-h-full p-1"
              />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 class="text-xl font-semibold text-white">{{ gateway.name }}</h3>
              <p class="text-gray-400 text-sm">{{ gateway.description }}</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-3">
            <span 
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="gateway.isActive ? 'bg-green-900 text-green-100' : 'bg-gray-700 text-gray-400'"
            >
              {{ gateway.isActive ? 'Ativo' : 'Inativo' }}
            </span>
            <button 
              @click="toggleGatewayActive(gateway)"
              class="p-2 rounded-md hover:bg-gray-700 transition-colors"
              :title="gateway.isActive ? 'Desativar gateway' : 'Ativar gateway'"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5" 
                :class="gateway.isActive ? 'text-green-400' : 'text-gray-400'"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M5 13l4 4L19 7" 
                  v-if="gateway.isActive"
                />
                <path 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  stroke-width="2" 
                  d="M6 18L18 6M6 6l12 12" 
                  v-else
                />
              </svg>
            </button>
            <button 
              @click="editGateway(gateway)"
              class="p-2 rounded-md hover:bg-gray-700 transition-colors text-blue-400"
              title="Editar configurações"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Configurações de uso -->
        <div class="px-6 pb-6 pt-2 border-t border-gray-700">
          <h4 class="text-sm font-medium text-gray-400 mb-3">Configuração de Uso</h4>
          <div class="flex space-x-6">
            <div class="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 mr-2" 
                :class="gateway.usageConfig.forDeposit ? 'text-green-400' : 'text-gray-500'"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span 
                class="text-sm"
                :class="gateway.usageConfig.forDeposit ? 'text-white' : 'text-gray-500'"
              >
                Depósito
              </span>
            </div>
            <div class="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 mr-2" 
                :class="gateway.usageConfig.forWithdraw ? 'text-green-400' : 'text-gray-500'"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span 
                class="text-sm"
                :class="gateway.usageConfig.forWithdraw ? 'text-white' : 'text-gray-500'"
              >
                Saque
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de edição -->
    <div 
      v-if="editingGateway" 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-white">Configurar {{ editingGateway.name }}</h3>
            <button 
              @click="cancelEdit"
              class="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveGatewaySettings">
            <!-- Configuração do Endpoint da API (apenas para super_admin) -->
            <div v-if="isSuperAdmin" class="space-y-2">
              <h4 class="text-lg font-medium text-white">Endpoint da API</h4>
              <div class="bg-gray-700 p-4 rounded-md">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-300 mb-1">URL do Endpoint</label>
                  <input 
                    v-model="editingGateway.apiEndpoint" 
                    type="text" 
                    class="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://api.unifypay.co"
                  />
                  <p class="mt-1 text-xs text-yellow-500">
                    <span class="font-bold">Atenção:</span> Alterar este valor pode causar falhas nas transações se o endpoint não estiver correto.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- Chaves de API -->
            <div class="space-y-2">
              <h4 class="text-lg font-medium text-white">Chaves de API</h4>
              <div class="bg-gray-700 p-4 rounded-md">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Chave Pública</label>
                  <input 
                    v-model="editingGateway.apiKeys.publicKey" 
                    type="text" 
                    class="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Chave pública do gateway"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-300 mb-1">Chave Secreta</label>
                  <input 
                    v-model="editingGateway.apiKeys.secretKey" 
                    type="password" 
                    class="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Chave secreta do gateway"
                  />
                </div>
              </div>
            </div>

            <!-- Configurações de uso -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-400 mb-3">Configuração de Uso</h4>
              
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="forDeposit"
                    v-model="editingGateway.usageConfig.forDeposit"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label for="forDeposit" class="ml-2 block text-sm text-gray-300">
                    Usar para Depósitos
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="forWithdraw"
                    v-model="editingGateway.usageConfig.forWithdraw"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label for="forWithdraw" class="ml-2 block text-sm text-gray-300">
                    Usar para Saques
                  </label>
                </div>
              </div>
            </div>

            <!-- Métodos de Pagamento -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-400 mb-3">Métodos de Pagamento</h4>
              
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="allowPix"
                    v-model="editingGateway.paymentMethods.allowPix"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label for="allowPix" class="ml-2 block text-sm text-gray-300">
                    Permitir PIX
                  </label>
                </div>
                
                <div class="flex items-center">
                  <input
                    id="allowCard"
                    v-model="editingGateway.paymentMethods.allowCard"
                    type="checkbox"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label for="allowCard" class="ml-2 block text-sm text-gray-300">
                    Permitir Cartão
                  </label>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-400 mb-3">Status</h4>
              
              <div class="flex items-center">
                <input
                  id="isActive"
                  v-model="editingGateway.isActive"
                  type="checkbox"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-600 rounded bg-gray-700"
                />
                <label for="isActive" class="ml-2 block text-sm text-gray-300">
                  Gateway Ativo
                </label>
              </div>
            </div>

            <!-- Botões de ação -->
            <div class="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                @click="cancelEdit"
                class="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors flex items-center"
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
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GatewaysSettingsView'
}
</script> 