<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useUserPaymentStore } from '../../stores/userPayment';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import type { PaymentGateway, WithdrawForm } from '../../types/payment';

const authStore = useAuthStore();
const paymentStore = useUserPaymentStore();
const router = useRouter();

const activeMethod = ref<'pix' | 'card'>('pix');

// Valores predefinidos para saque
const predefinedValues = [50, 100, 200, 500];

// Formulário de saque
const withdrawForm = reactive<WithdrawForm>({
  amount: 100,
  customAmount: '',
  pixKey: '',
  pixKeyType: '',
  cardNumber: '',
  cardName: '',
  cardBank: '',
  gateway: '',
  balance: ''
});

// Tipos de chave PIX
const pixKeyTypes = [
  { value: 'cpf', label: 'CPF' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' }
];

// Erros de validação
const errors = reactive({
  amount: '',
  pixKey: '',
  pixKeyType: '',
  cardNumber: '',
  cardName: '',
  cardBank: '',
  gateway: '',
  balance: ''
});

// Valor formatado
const formattedAmount = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(withdrawForm.amount);
});

// Verificar se o método de pagamento está disponível
const isPixAvailable = computed(() => {
  if (!paymentStore.selectedGateway) return false;
  return paymentStore.selectedGateway.paymentMethods?.allowPix ?? 
         paymentStore.selectedGateway.allowPix ?? 
         true;
});

const isCardAvailable = computed(() => {
  if (!paymentStore.selectedGateway) return false;
  return paymentStore.selectedGateway.paymentMethods?.allowCard ?? 
         paymentStore.selectedGateway.allowCard ?? 
         true;
});

// Verificar se o usuário tem saldo suficiente
const hasSufficientBalance = computed(() => {
  if (!authStore.user) return false;
  return authStore.user.balance >= withdrawForm.amount;
});

// Valor selecionado (predefinido ou personalizado)
const selectedAmount = ref<number | 'custom'>(100);

// Observar mudanças no valor personalizado e aplicar automaticamente
watch(() => withdrawForm.customAmount, (newValue) => {
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
  withdrawForm.amount = value;
  withdrawForm.customAmount = '';
  selectedAmount.value = value;
  errors.amount = '';
  errors.balance = '';
}

// Validar e definir valor personalizado
function validateAndSetCustomAmount(value: number) {
  if (isNaN(value) || value <= 0) {
    errors.amount = 'Digite um valor válido';
    return;
  }
  
  if (value < 50) {
    errors.amount = 'O valor mínimo para saque é R$ 50,00';
    return;
  }
  
  if (value > 5000) {
    errors.amount = 'O valor máximo para saque é R$ 5.000,00';
    return;
  }
  
  withdrawForm.amount = value;
  selectedAmount.value = 'custom';
  errors.amount = '';
}

// Função legada para compatibilidade com o botão "Definir"
function setCustomAmount() {
  const value = parseFloat(withdrawForm.customAmount.replace(',', '.'));
  validateAndSetCustomAmount(value);
}

// Validar formulário PIX
function validatePixForm() {
  let isValid = true;
  
  if (!withdrawForm.pixKey) {
    errors.pixKey = 'Digite sua chave PIX';
    isValid = false;
  } else {
    // Validação específica para cada tipo de chave PIX
    if (withdrawForm.pixKeyType === 'cpf' && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(withdrawForm.pixKey)) {
      errors.pixKey = 'CPF inválido (formato: 000.000.000-00)';
      isValid = false;
    } else if (withdrawForm.pixKeyType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(withdrawForm.pixKey)) {
      errors.pixKey = 'E-mail inválido';
      isValid = false;
    } else if (withdrawForm.pixKeyType === 'phone' && !/^\(\d{2}\) \d{5}-\d{4}$/.test(withdrawForm.pixKey)) {
      errors.pixKey = 'Telefone inválido (formato: (00) 00000-0000)';
      isValid = false;
    } else {
      errors.pixKey = '';
    }
  }
  
  return isValid;
}

// Validar formulário de cartão
function validateCardForm() {
  let isValid = true;
  
  if (!withdrawForm.cardNumber) {
    errors.cardNumber = 'Digite o número do cartão';
    isValid = false;
  } else if (!/^\d{16}$/.test(withdrawForm.cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Número de cartão inválido';
    isValid = false;
  } else {
    errors.cardNumber = '';
  }
  
  if (!withdrawForm.cardName) {
    errors.cardName = 'Digite o nome do titular do cartão';
    isValid = false;
  } else {
    errors.cardName = '';
  }
  
  if (!withdrawForm.cardBank) {
    errors.cardBank = 'Digite o nome do banco';
    isValid = false;
  } else {
    errors.cardBank = '';
  }
  
  return isValid;
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

// Variáveis de estado para processamento
const isProcessing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Processar saque
const processWithdraw = async () => {
  isProcessing.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Validar valor de saque
    let withdrawAmount = 0;
    if (selectedAmount.value === 'custom') {
      if (!withdrawForm.customAmount) {
        errorMessage.value = 'Por favor, insira um valor personalizado';
        isProcessing.value = false;
        return;
      }
      withdrawAmount = parseFloat(withdrawForm.customAmount);
    } else {
      withdrawAmount = withdrawForm.amount;
    }

    if (withdrawAmount <= 0) {
      errorMessage.value = 'O valor do saque deve ser maior que zero';
      isProcessing.value = false;
      return;
    }

    if (withdrawAmount > parseFloat(withdrawForm.balance)) {
      errorMessage.value = 'Saldo insuficiente para este saque';
      isProcessing.value = false;
      return;
    }

    // Validar método de pagamento
    if (activeMethod.value === 'pix') {
      if (!withdrawForm.pixKey) {
        errorMessage.value = 'Por favor, insira sua chave PIX';
        isProcessing.value = false;
        return;
      }
      if (!withdrawForm.pixKeyType) {
        errorMessage.value = 'Por favor, selecione o tipo de chave PIX';
        isProcessing.value = false;
        return;
      }
    } else if (activeMethod.value === 'card') {
      if (!withdrawForm.cardNumber || !withdrawForm.cardName || !withdrawForm.cardBank) {
        errorMessage.value = 'Por favor, preencha todos os dados do cartão';
        isProcessing.value = false;
        return;
      }
    }

    // Verificar se há um gateway selecionado
    if (!paymentStore.selectedGateway) {
      errorMessage.value = 'Selecione um gateway de pagamento';
      isProcessing.value = false;
      return;
    }

    // Preparar dados para envio
    const withdrawData = {
      amount: withdrawAmount,
      method: activeMethod.value,
      pixKey: activeMethod.value === 'pix' ? withdrawForm.pixKey : undefined,
      pixKeyType: activeMethod.value === 'pix' ? withdrawForm.pixKeyType : undefined,
      cardNumber: activeMethod.value === 'card' ? withdrawForm.cardNumber : undefined,
      cardName: activeMethod.value === 'card' ? withdrawForm.cardName : undefined,
      cardBank: activeMethod.value === 'card' ? withdrawForm.cardBank : undefined
    };

    // Processar saque
    const result = await paymentStore.processWithdraw(withdrawData);
    
    if (result) {
      successMessage.value = 'Solicitação de saque enviada com sucesso!';
      // Resetar formulário
      withdrawForm.customAmount = '';
      withdrawForm.pixKey = '';
      withdrawForm.pixKeyType = '';
      withdrawForm.cardNumber = '';
      withdrawForm.cardName = '';
      withdrawForm.cardBank = '';
    } else {
      errorMessage.value = paymentStore.error || 'Erro ao processar saque';
    }
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    errorMessage.value = 'Ocorreu um erro ao processar seu saque. Tente novamente.';
  } finally {
    isProcessing.value = false;
  }
};

// Resetar formulário
function resetForm() {
  withdrawForm.amount = 100;
  withdrawForm.customAmount = '';
  withdrawForm.pixKey = '';
  withdrawForm.pixKeyType = 'cpf';
  withdrawForm.cardNumber = '';
  withdrawForm.cardName = '';
  withdrawForm.cardBank = '';
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  paymentStore.resetState();
}

// Carregar gateways ao montar o componente
onMounted(async () => {
  await paymentStore.fetchAvailableGateways();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">Saque</h1>
      
      <div v-if="!paymentStore.showSuccessMessage" class="card p-6">
        <!-- Saldo disponível -->
        <div class="mb-6 p-4 bg-gray-700 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Saldo disponível:</span>
            <span class="text-xl font-bold text-primary-500">
              {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(authStore.user?.balance || 0) }}
            </span>
          </div>
        </div>
        
        <!-- Seleção de gateway (se houver mais de um) -->
        <div v-if="paymentStore.hasMultipleWithdrawGateways" class="mb-6">
          <h2 class="text-xl font-bold mb-4">Selecione o Processador de Pagamento</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              v-for="gateway in paymentStore.withdrawGateways" 
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
          <h2 class="text-xl font-bold mb-4">Método de Saque</h2>
          
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
              <span class="text-sm text-gray-400">Transferência bancária</span>
            </button>
          </div>
        </div>
        
        <!-- Seleção de valor -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">Valor do Saque</h2>
          
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <button 
              v-for="value in predefinedValues" 
              :key="value"
              @click="selectAmount(value)"
              class="p-3 rounded-lg border-2 text-center"
              :class="[
                withdrawForm.amount === value ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800',
                (authStore.user?.balance || 0) < value ? 'opacity-50 cursor-not-allowed' : ''
              ]"
              :disabled="(authStore.user?.balance || 0) < value"
            >
              {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }}
            </button>
          </div>
          
          <div class="flex items-center gap-3">
            <div class="flex-grow">
              <label class="block text-sm font-medium text-gray-400 mb-1">Outro valor</label>
              <input
                v-model="withdrawForm.customAmount"
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
          <p v-if="errors.balance" class="mt-2 text-red-500 text-sm">{{ errors.balance }}</p>
        </div>
        
        <!-- Formulário de saque via PIX -->
        <div v-if="activeMethod === 'pix'" class="mb-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Tipo de Chave PIX</label>
            <select
              v-model="withdrawForm.pixKeyType"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Selecione o tipo de chave</option>
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave Aleatória</option>
            </select>
            <p v-if="errors.pixKeyType" class="mt-1 text-red-500 text-sm">{{ errors.pixKeyType }}</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Chave PIX</label>
            <input
              v-model="withdrawForm.pixKey"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Digite sua chave PIX"
            />
            <p v-if="errors.pixKey" class="mt-1 text-red-500 text-sm">{{ errors.pixKey }}</p>
          </div>
        </div>
        
        <!-- Formulário de saque via cartão -->
        <div v-if="activeMethod === 'card'" class="mb-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Número do Cartão</label>
            <input
              v-model="withdrawForm.cardNumber"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="0000 0000 0000 0000"
            />
            <p v-if="errors.cardNumber" class="mt-1 text-red-500 text-sm">{{ errors.cardNumber }}</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Nome no Cartão</label>
            <input
              v-model="withdrawForm.cardName"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Digite o nome como está no cartão"
            />
            <p v-if="errors.cardName" class="mt-1 text-red-500 text-sm">{{ errors.cardName }}</p>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Banco</label>
            <input
              v-model="withdrawForm.cardBank"
              type="text"
              class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Digite o nome do banco"
            />
            <p v-if="errors.cardBank" class="mt-1 text-red-500 text-sm">{{ errors.cardBank }}</p>
          </div>
        </div>
        
        <!-- Botão de saque -->
        <div class="mt-8">
          <button
            @click="processWithdraw"
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
            {{ paymentStore.isLoading ? 'Processando...' : 'Sacar ' + formattedAmount }}
          </button>
        </div>
      </div>
      
      <!-- Tela de sucesso -->
      <div v-else class="card p-6">
        <div class="text-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <h2 class="text-2xl font-bold mb-2">Solicitação de Saque Enviada</h2>
          <p class="text-gray-400">Sua solicitação de saque foi enviada com sucesso e está em processamento.</p>
        </div>
        
        <div class="bg-gray-700 p-4 rounded-lg mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-300">Valor do saque:</span>
            <span class="font-bold">{{ formattedAmount }}</span>
          </div>
          <div class="flex justify-between items-center mb-2">
            <span class="text-gray-300">Método:</span>
            <span>{{ activeMethod === 'pix' ? 'PIX' : 'Cartão' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-300">Status:</span>
            <span class="text-yellow-500">Em processamento</span>
          </div>
        </div>
        
        <div class="text-center text-gray-400 mb-6">
          <p>O processamento do saque pode levar até 24 horas úteis.</p>
          <p>Você receberá uma notificação quando o saque for concluído.</p>
        </div>
        
        <button
          @click="resetForm"
          class="w-full py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  @apply bg-gray-800 rounded-lg shadow-lg;
}
</style> 