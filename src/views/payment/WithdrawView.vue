<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { ElMessage } from 'element-plus';
import UserBalance from '../../components/common/UserBalance.vue';

const authStore = useAuthStore();

const isLoading = ref(false);
const showSuccessMessage = ref(false);

// Formulário de saque
const withdrawForm = reactive({
  amount: 100,
  customAmount: '',
  pixKey: '',
  pixKeyType: 'cpf'
});

// Erros de validação
const errors = reactive({
  amount: '',
  pixKey: ''
});

// Valor formatado
const formattedAmount = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(withdrawForm.amount);
});

// Saldo do usuário
const userBalance = computed(() => authStore.user?.balance || 0);

// Nome do usuário
const userName = computed(() => authStore.user?.name || '');

// Valores predefinidos para saque
const predefinedValues = [50, 100, 200, 500];

// Tipos de chave PIX
const pixKeyTypes = [
  { value: 'cpf', label: 'CPF' },
  { value: 'email', label: 'E-mail' },
  { value: 'phone', label: 'Telefone' },
  { value: 'random', label: 'Chave Aleatória' }
];

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
  errors.amount = '';
}

// Validar e definir valor personalizado
function validateAndSetCustomAmount(value: number) {
  if (isNaN(value) || value <= 0) {
    errors.amount = 'Digite um valor válido';
    return;
  }
  
  if (value < 20) {
    errors.amount = 'O valor mínimo para saque é R$ 20,00';
    return;
  }
  
  if (value > userBalance.value) {
    errors.amount = 'Saldo insuficiente para este valor';
    return;
  }
  
  withdrawForm.amount = value;
  errors.amount = '';
}

// Função legada para compatibilidade com o botão "Definir"
function setCustomAmount() {
  const value = parseFloat(withdrawForm.customAmount.replace(',', '.'));
  validateAndSetCustomAmount(value);
}

// Validar formulário
function validateForm() {
  let isValid = true;
  
  // Validar valor
  if (withdrawForm.amount < 20) {
    errors.amount = 'O valor mínimo para saque é R$ 20,00';
    isValid = false;
  } else if (withdrawForm.amount > userBalance.value) {
    errors.amount = 'Saldo insuficiente para este valor';
    isValid = false;
  } else {
    errors.amount = '';
  }
  
  // Validar chave PIX
  if (!withdrawForm.pixKey) {
    errors.pixKey = 'Digite sua chave PIX';
    isValid = false;
  } else {
    // Validar formato da chave PIX de acordo com o tipo
    switch (withdrawForm.pixKeyType) {
      case 'cpf':
        if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(withdrawForm.pixKey)) {
          errors.pixKey = 'CPF inválido (formato: 000.000.000-00)';
          isValid = false;
        } else {
          errors.pixKey = '';
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(withdrawForm.pixKey)) {
          errors.pixKey = 'E-mail inválido';
          isValid = false;
        } else {
          errors.pixKey = '';
        }
        break;
      case 'phone':
        if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(withdrawForm.pixKey)) {
          errors.pixKey = 'Telefone inválido (formato: (00) 00000-0000)';
          isValid = false;
        } else {
          errors.pixKey = '';
        }
        break;
      case 'random':
        if (withdrawForm.pixKey.length < 8) {
          errors.pixKey = 'Chave PIX inválida';
          isValid = false;
        } else {
          errors.pixKey = '';
        }
        break;
    }
  }
  
  return isValid;
}

// Processar saque
async function processWithdraw() {
  if (!validateForm()) return;
  
  isLoading.value = true;
  
  try {
    // Simulação de processamento de saque
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Atualizar saldo do usuário (simulação)
    if (authStore.user) {
      authStore.user.balance -= withdrawForm.amount;
    }
    
    showSuccessMessage.value = true;
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    ElMessage.error('Não foi possível processar o saque. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

// Voltar para o formulário
function resetForm() {
  withdrawForm.amount = 100;
  withdrawForm.customAmount = '';
  withdrawForm.pixKey = '';
  withdrawForm.pixKeyType = 'cpf';
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  showSuccessMessage.value = false;
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">Saque</h1>
      
      <div class="mb-6 flex justify-center">
        <UserBalance size="large" />
      </div>
      
      <div v-if="!showSuccessMessage" class="card p-6">
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
                value > userBalance ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              ]"
              :disabled="value > userBalance"
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
                class="input w-full"
                placeholder="R$ 0,00"
                :class="{ 'border-red-500': errors.amount }"
              />
            </div>
            <button 
              @click="setCustomAmount"
              class="btn-primary mt-6"
            >
              Definir
            </button>
          </div>
          
          <p v-if="errors.amount" class="text-red-500 text-sm mt-1">{{ errors.amount }}</p>
          <p class="text-sm text-gray-400 mt-2">Valor mínimo: R$ 20,00 | Saldo disponível: {{ new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(userBalance) }}</p>
        </div>
        
        <!-- Dados para saque -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">Dados para Saque via PIX</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Tipo de Chave PIX</label>
              <select 
                v-model="withdrawForm.pixKeyType"
                class="input w-full"
              >
                <option 
                  v-for="type in pixKeyTypes" 
                  :key="type.value" 
                  :value="type.value"
                >
                  {{ type.label }}
                </option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Chave PIX</label>
              <input 
                v-model="withdrawForm.pixKey"
                type="text"
                class="input w-full"
                :placeholder="
                  withdrawForm.pixKeyType === 'cpf' ? '000.000.000-00' :
                  withdrawForm.pixKeyType === 'email' ? 'exemplo@email.com' :
                  withdrawForm.pixKeyType === 'phone' ? '(00) 00000-0000' :
                  'Sua chave aleatória'
                "
                :class="{ 'border-red-500': errors.pixKey }"
              />
              <p v-if="errors.pixKey" class="text-red-500 text-sm mt-1">{{ errors.pixKey }}</p>
            </div>
            
            <div class="bg-gray-700 p-3 rounded-lg">
              <div class="flex items-center">
                <div class="flex-shrink-0 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p class="text-sm text-gray-300">
                  O saque será processado para <span class="font-medium text-white">{{ userName }}</span>, conforme seus dados de cadastro.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resumo e botão de confirmação -->
        <div class="border-t border-gray-700 pt-6">
          <div class="flex justify-between items-center mb-6">
            <span class="text-lg">Total a receber:</span>
            <span class="text-2xl font-bold text-primary-500">{{ formattedAmount }}</span>
          </div>
          
          <button 
            @click="processWithdraw"
            class="btn-primary w-full py-3 text-lg"
            :disabled="isLoading || withdrawForm.amount > userBalance"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <span class="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
              Processando...
            </span>
            <span v-else>Solicitar Saque</span>
          </button>
        </div>
      </div>
      
      <!-- Tela de sucesso -->
      <div v-else class="card p-6">
        <div class="text-center mb-6">
          <div class="text-5xl mb-4">✅</div>
          <h2 class="text-2xl font-bold mb-2">Saque Solicitado com Sucesso!</h2>
          <p class="text-gray-400">
            Seu saque de {{ formattedAmount }} foi solicitado e será processado em breve.
          </p>
        </div>
        
        <div class="bg-gray-700 p-4 rounded-lg mb-6">
          <h3 class="font-medium mb-2">Detalhes do Saque</h3>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div class="text-gray-400">Valor:</div>
            <div class="text-right">{{ formattedAmount }}</div>
            
            <div class="text-gray-400">Chave PIX:</div>
            <div class="text-right">{{ withdrawForm.pixKey }}</div>
            
            <div class="text-gray-400">Tipo de Chave:</div>
            <div class="text-right">{{ pixKeyTypes.find(t => t.value === withdrawForm.pixKeyType)?.label }}</div>
            
            <div class="text-gray-400">Nome:</div>
            <div class="text-right">{{ userName }}</div>
            
            <div class="text-gray-400">Status:</div>
            <div class="text-right text-yellow-500">Em processamento</div>
          </div>
        </div>
        
        <p class="text-sm text-gray-400 mb-6 text-center">
          O valor será transferido para sua conta em até 24 horas úteis.
        </p>
        
        <button 
          @click="resetForm"
          class="btn-primary w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'WithdrawView'
}
</script> 