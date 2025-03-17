<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useUserPaymentStore } from '../../stores/userPayment';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import type { PaymentGateway } from '../../types/payment';
import axios from 'axios';

const authStore = useAuthStore();
const paymentStore = useUserPaymentStore();
const router = useRouter();

const activeMethod = ref<'pix' | 'card'>('pix');

// Valores predefinidos para depósito
const predefinedValues = [50, 100, 200, 500];

// Formulário de depósito
const depositForm = reactive({
  amount: 100,
  customAmount: ''
});

// Erros de validação
const errors = reactive({
  amount: '',
  gateway: ''
});

// Valor formatado
const formattedAmount = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(depositForm.amount);
});

// Verificar se o método de pagamento está disponível
const isPixAvailable = computed(() => {
  if (!paymentStore.selectedGateway) return false;
  return paymentStore.selectedGateway.paymentMethods.allowPix;
});

const isCardAvailable = computed(() => {
  if (!paymentStore.selectedGateway) return false;
  return paymentStore.selectedGateway.paymentMethods.allowCard;
});

// Observar mudanças no valor personalizado e aplicar automaticamente
watch(() => depositForm.customAmount, (newValue) => {
  if (newValue) {
    // Remover caracteres não numéricos, exceto ponto e vírgula
    const cleanValue = newValue.replace(/[^\d.,]/g, '');
    
    // Substituir vírgula por ponto para conversão
    const numericValue = parseFloat(cleanValue.replace(',', '.'));
    
    if (!isNaN(numericValue)) {
      validateAndSetCustomAmount(numericValue);
    }
  }
});

// Selecionar valor predefinido
function selectAmount(value: number) {
  depositForm.amount = value;
  depositForm.customAmount = '';
  errors.amount = '';
}

// Validar e definir valor personalizado
function validateAndSetCustomAmount(value: number) {
  if (isNaN(value) || value <= 0) {
    errors.amount = 'Digite um valor válido';
    return;
  }
  
  if (value < 20) {
    errors.amount = 'O valor mínimo para depósito é R$ 20,00';
    return;
  }
  
  if (value > 10000) {
    errors.amount = 'O valor máximo para depósito é R$ 10.000,00';
    return;
  }
  
  depositForm.amount = value;
  errors.amount = '';
}

// Função legada para compatibilidade com o botão "Definir"
function setCustomAmount() {
  const value = parseFloat(depositForm.customAmount.replace(',', '.'));
  validateAndSetCustomAmount(value);
}

// Processar depósito
async function processDeposit() {
  // Validar valor
  if (depositForm.amount < 20) {
    errors.amount = 'O valor mínimo para depósito é R$ 20,00';
    return;
  }
  
  // Verificar se há um gateway selecionado
  if (!paymentStore.selectedGateway) {
    errors.gateway = 'Selecione um gateway de pagamento';
    return;
  }
  
  // Verificar se o método de pagamento está disponível
  if (activeMethod.value === 'pix' && !isPixAvailable.value) {
    errors.gateway = 'Este gateway não suporta pagamentos via PIX';
    return;
  }
  
  if (activeMethod.value === 'card' && !isCardAvailable.value) {
    errors.gateway = 'Este gateway não suporta pagamentos via cartão';
    return;
  }
  
  // Processar depósito usando a store
  await paymentStore.processDeposit(depositForm.amount, activeMethod.value);
}

// Verificar status do depósito (simulação)
async function checkDepositStatus() {
  await paymentStore.checkDepositStatus();
}

// Copiar código PIX para a área de transferência
function copyPixCode() {
  navigator.clipboard.writeText(paymentStore.pixCode);
  ElMessage.success('Código PIX copiado para a área de transferência!');
}

// Selecionar gateway
function selectGateway(gateway: PaymentGateway) {
  paymentStore.selectGateway(gateway);
  errors.gateway = '';
  
  // Verificar métodos de pagamento disponíveis
  if (gateway.paymentMethods.allowPix && !gateway.paymentMethods.allowCard) {
    activeMethod.value = 'pix';
  } else if (!gateway.paymentMethods.allowPix && gateway.paymentMethods.allowCard) {
    activeMethod.value = 'card';
  }
}

// Resetar formulário
function resetForm() {
  depositForm.amount = 100;
  depositForm.customAmount = '';
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  paymentStore.resetState();
}

// Carregar gateways ao montar o componente
onMounted(async () => {
  console.log('Inicializando DepositView');
  console.log('Token de autenticação:', authStore.token);
  console.log('Usuário autenticado:', authStore.isAuthenticated);
  
  try {
    await paymentStore.fetchAvailableGateways();
  } catch (err) {
    console.error('Erro ao carregar gateways:', err);
    ElMessage.error('Não foi possível carregar os gateways de pagamento. Tente novamente mais tarde.');
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">Depósito</h1>
      
      <div v-if="!paymentStore.showSuccessMessage" class="card p-6">
        <!-- Seleção de gateway (se houver mais de um) -->
        <div v-if="paymentStore.hasMultipleDepositGateways" class="mb-6">
          <h2 class="text-xl font-bold mb-4">Selecione o Processador de Pagamento</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              v-for="gateway in paymentStore.depositGateways" 
              :key="gateway.id"
              @click="selectGateway(gateway)"
              class="p-4 rounded-lg border-2 flex flex-col items-center justify-center"
              :class="paymentStore.selectedGateway?.id === gateway.id ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800'"
            >
              <div class="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center mb-2">
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
              <span class="text-lg">{{ gateway.name }}</span>
            </button>
          </div>
          
          <p v-if="errors.gateway" class="mt-2 text-red-500 text-sm">{{ errors.gateway }}</p>
        </div>
        
        <!-- Seleção de método de pagamento -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">Método de Pagamento</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="activeMethod = 'pix'"
              class="p-4 rounded-lg border-2 flex flex-col items-center justify-center"
              :class="[
                activeMethod === 'pix' ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800',
                !isPixAvailable ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :disabled="!isPixAvailable"
            >
              <span class="text-xl mb-2">PIX</span>
              <span class="text-sm text-gray-400">Transferência instantânea</span>
            </button>
            
            <button 
              @click="activeMethod = 'card'"
              class="p-4 rounded-lg border-2 flex flex-col items-center justify-center"
              :class="[
                activeMethod === 'card' ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800',
                !isCardAvailable ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :disabled="!isCardAvailable"
            >
              <span class="text-xl mb-2">Cartão</span>
              <span class="text-sm text-gray-400">Crédito ou Débito</span>
            </button>
          </div>
        </div>
        
        <!-- Seleção de valor -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">Valor do Depósito</h2>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <button 
              v-for="value in predefinedValues" 
              :key="value"
              @click="selectAmount(value)"
              class="p-3 rounded-lg border-2 text-center"
              :class="depositForm.amount === value ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800'"
            >
              {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }}
            </button>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex-grow">
              <label class="block text-sm font-medium text-gray-400 mb-1">Outro valor</label>
              <input
                v-model="depositForm.customAmount"
                type="text"
                class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="R$ 0,00"
              />
            </div>
            <button
              @click="setCustomAmount"
              class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors mt-6"
            >
              Definir
            </button>
          </div>
          
          <p v-if="errors.amount" class="mt-2 text-red-500 text-sm">{{ errors.amount }}</p>
        </div>
        
        <!-- Botão de depósito -->
        <div class="mt-8">
          <button
            @click="processDeposit"
            class="w-full py-3 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors flex items-center justify-center"
            :disabled="paymentStore.isLoading"
          >
            <svg 
              v-if="paymentStore.isLoading" 
              class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ paymentStore.isLoading ? 'Processando...' : 'Depositar ' + formattedAmount }}
          </button>
        </div>
      </div>
      
      <!-- Tela de sucesso para PIX -->
      <div v-else-if="activeMethod === 'pix'" class="card p-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold mb-2">Depósito via PIX</h2>
          <p class="text-gray-400">Escaneie o QR Code ou copie o código PIX abaixo para realizar o pagamento.</p>
        </div>
        
        <div class="flex flex-col items-center mb-6">
          <div class="bg-white p-4 rounded-lg mb-4">
            <img :src="paymentStore.qrCodeUrl" alt="QR Code PIX" class="w-48 h-48" />
          </div>
          
          <div class="w-full">
            <div class="flex items-center justify-between bg-gray-700 p-3 rounded-md mb-4">
              <div class="truncate flex-grow mr-2">{{ paymentStore.pixCode }}</div>
              <button
                @click="copyPixCode"
                class="px-3 py-1 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors flex-shrink-0"
              >
                Copiar
              </button>
            </div>
            
            <div class="text-center">
              <p class="text-gray-400 mb-2">Valor a pagar:</p>
              <p class="text-2xl font-bold text-primary-500">{{ formattedAmount }}</p>
            </div>
          </div>
        </div>
        
        <div class="mt-8 flex flex-col space-y-4">
          <button
            @click="checkDepositStatus"
            class="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
            :disabled="paymentStore.isLoading"
          >
            <svg 
              v-if="paymentStore.isLoading" 
              class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ paymentStore.isLoading ? 'Verificando...' : 'Já fiz o pagamento' }}
          </button>
          
          <button
            @click="resetForm"
            class="w-full py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-gray-800 rounded-lg shadow-lg;
}
</style>

<script lang="ts">
export default {
  name: 'DepositView'
}
</script> 