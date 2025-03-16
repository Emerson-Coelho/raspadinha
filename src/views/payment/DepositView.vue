<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();

const isLoading = ref(false);
const activeMethod = ref<'pix' | 'card'>('pix');
const showSuccessMessage = ref(false);
const qrCodeUrl = ref('');
const pixCode = ref('');

// Valores predefinidos para depósito
const predefinedValues = [50, 100, 200, 500];

// Formulário de depósito
const depositForm = reactive({
  amount: 100,
  customAmount: '',
  
  // Dados do cartão
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvv: '',
  
  // Dados do PIX
  pixName: '',
  pixCpf: ''
});

// Erros de validação
const errors = reactive({
  amount: '',
  cardNumber: '',
  cardName: '',
  cardExpiry: '',
  cardCvv: '',
  pixName: '',
  pixCpf: ''
});

// Valor formatado
const formattedAmount = computed(() => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(depositForm.amount);
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

// Validar formulário de cartão
function validateCardForm() {
  let isValid = true;
  
  // Validar número do cartão
  if (!depositForm.cardNumber) {
    errors.cardNumber = 'Digite o número do cartão';
    isValid = false;
  } else if (!/^\d{16}$/.test(depositForm.cardNumber.replace(/\s/g, ''))) {
    errors.cardNumber = 'Número de cartão inválido';
    isValid = false;
  } else {
    errors.cardNumber = '';
  }
  
  // Validar nome no cartão
  if (!depositForm.cardName) {
    errors.cardName = 'Digite o nome impresso no cartão';
    isValid = false;
  } else {
    errors.cardName = '';
  }
  
  // Validar data de validade
  if (!depositForm.cardExpiry) {
    errors.cardExpiry = 'Digite a data de validade';
    isValid = false;
  } else if (!/^\d{2}\/\d{2}$/.test(depositForm.cardExpiry)) {
    errors.cardExpiry = 'Formato inválido (MM/AA)';
    isValid = false;
  } else {
    errors.cardExpiry = '';
  }
  
  // Validar CVV
  if (!depositForm.cardCvv) {
    errors.cardCvv = 'Digite o código de segurança';
    isValid = false;
  } else if (!/^\d{3,4}$/.test(depositForm.cardCvv)) {
    errors.cardCvv = 'CVV inválido';
    isValid = false;
  } else {
    errors.cardCvv = '';
  }
  
  return isValid;
}

// Validar formulário PIX
function validatePixForm() {
  let isValid = true;
  
  // Validar nome
  if (!depositForm.pixName) {
    errors.pixName = 'Digite seu nome completo';
    isValid = false;
  } else {
    errors.pixName = '';
  }
  
  // Validar CPF
  if (!depositForm.pixCpf) {
    errors.pixCpf = 'Digite seu CPF';
    isValid = false;
  } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(depositForm.pixCpf)) {
    errors.pixCpf = 'CPF inválido (formato: 000.000.000-00)';
    isValid = false;
  } else {
    errors.pixCpf = '';
  }
  
  return isValid;
}

// Processar depósito
async function processDeposit() {
  // Validar valor
  if (depositForm.amount < 20) {
    errors.amount = 'O valor mínimo para depósito é R$ 20,00';
    return;
  }
  
  // Validar formulário de acordo com o método selecionado
  if (activeMethod.value === 'card' && !validateCardForm()) {
    return;
  }
  
  if (activeMethod.value === 'pix' && !validatePixForm()) {
    return;
  }
  
  isLoading.value = true;
  
  try {
    // Simulação de processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (activeMethod.value === 'pix') {
      // Simulação de geração de QR Code e código PIX
      qrCodeUrl.value = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028-f142a1dd04b5520400005303986540' + depositForm.amount + '5802BR5913Raspadinha SA6008Sao Paulo62070503***63041D14';
      pixCode.value = '00020126580014BR.GOV.BCB.PIX0136a629532e-7693-4846-b028-f142a1dd04b5520400005303986540' + depositForm.amount + '5802BR5913Raspadinha SA6008Sao Paulo62070503***63041D14';
      
      showSuccessMessage.value = true;
    } else {
      // Simulação de processamento de cartão
      // Na implementação real, você chamaria a API do gateway de pagamento
      
      // Atualizar saldo do usuário (simulação)
      if (authStore.user) {
        authStore.user.balance += depositForm.amount;
      }
      
      ElMessage.success('Depósito realizado com sucesso!');
      resetForm();
    }
  } catch (error) {
    console.error('Erro ao processar depósito:', error);
    ElMessage.error('Não foi possível processar o depósito. Tente novamente.');
  } finally {
    isLoading.value = false;
  }
}

// Copiar código PIX para a área de transferência
function copyPixCode() {
  navigator.clipboard.writeText(pixCode.value);
  ElMessage.success('Código PIX copiado para a área de transferência!');
}

// Resetar formulário
function resetForm() {
  depositForm.amount = 100;
  depositForm.customAmount = '';
  depositForm.cardNumber = '';
  depositForm.cardName = '';
  depositForm.cardExpiry = '';
  depositForm.cardCvv = '';
  depositForm.pixName = '';
  depositForm.pixCpf = '';
  
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = '';
  });
  
  showSuccessMessage.value = false;
  qrCodeUrl.value = '';
  pixCode.value = '';
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold mb-8 text-center">Depósito</h1>
      
      <div v-if="!showSuccessMessage" class="card p-6">
        <!-- Seleção de método de pagamento -->
        <div class="mb-6">
          <h2 class="text-xl font-bold mb-4">Método de Pagamento</h2>
          
          <div class="grid grid-cols-2 gap-4">
            <button 
              @click="activeMethod = 'pix'"
              class="p-4 rounded-lg border-2 flex flex-col items-center justify-center"
              :class="activeMethod === 'pix' ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800'"
            >
              <span class="text-xl mb-2">PIX</span>
              <span class="text-sm text-gray-400">Transferência instantânea</span>
            </button>
            
            <button 
              @click="activeMethod = 'card'"
              class="p-4 rounded-lg border-2 flex flex-col items-center justify-center"
              :class="activeMethod === 'card' ? 'border-primary-500 bg-gray-700' : 'border-gray-700 bg-gray-800'"
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
          <p class="text-sm text-gray-400 mt-2">Valor mínimo: R$ 20,00 | Valor máximo: R$ 10.000,00</p>
        </div>
        
        <!-- Formulário de cartão -->
        <div v-if="activeMethod === 'card'" class="mb-6">
          <h2 class="text-xl font-bold mb-4">Dados do Cartão</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Número do Cartão</label>
              <input 
                v-model="depositForm.cardNumber"
                type="text"
                class="input w-full"
                placeholder="0000 0000 0000 0000"
                :class="{ 'border-red-500': errors.cardNumber }"
              />
              <p v-if="errors.cardNumber" class="text-red-500 text-sm mt-1">{{ errors.cardNumber }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Nome no Cartão</label>
              <input 
                v-model="depositForm.cardName"
                type="text"
                class="input w-full"
                placeholder="Nome como impresso no cartão"
                :class="{ 'border-red-500': errors.cardName }"
              />
              <p v-if="errors.cardName" class="text-red-500 text-sm mt-1">{{ errors.cardName }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">Validade</label>
                <input 
                  v-model="depositForm.cardExpiry"
                  type="text"
                  class="input w-full"
                  placeholder="MM/AA"
                  :class="{ 'border-red-500': errors.cardExpiry }"
                />
                <p v-if="errors.cardExpiry" class="text-red-500 text-sm mt-1">{{ errors.cardExpiry }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-1">CVV</label>
                <input 
                  v-model="depositForm.cardCvv"
                  type="text"
                  class="input w-full"
                  placeholder="000"
                  :class="{ 'border-red-500': errors.cardCvv }"
                />
                <p v-if="errors.cardCvv" class="text-red-500 text-sm mt-1">{{ errors.cardCvv }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Formulário PIX -->
        <div v-if="activeMethod === 'pix'" class="mb-6">
          <h2 class="text-xl font-bold mb-4">Dados para PIX</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">Nome Completo</label>
              <input 
                v-model="depositForm.pixName"
                type="text"
                class="input w-full"
                placeholder="Seu nome completo"
                :class="{ 'border-red-500': errors.pixName }"
              />
              <p v-if="errors.pixName" class="text-red-500 text-sm mt-1">{{ errors.pixName }}</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-1">CPF</label>
              <input 
                v-model="depositForm.pixCpf"
                type="text"
                class="input w-full"
                placeholder="000.000.000-00"
                :class="{ 'border-red-500': errors.pixCpf }"
              />
              <p v-if="errors.pixCpf" class="text-red-500 text-sm mt-1">{{ errors.pixCpf }}</p>
            </div>
          </div>
        </div>
        
        <!-- Resumo e botão de confirmação -->
        <div class="border-t border-gray-700 pt-6">
          <div class="flex justify-between items-center mb-6">
            <span class="text-lg">Total:</span>
            <span class="text-2xl font-bold text-primary-500">{{ formattedAmount }}</span>
          </div>
          
          <button 
            @click="processDeposit"
            class="btn-primary w-full py-3 text-lg"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <span class="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
              Processando...
            </span>
            <span v-else>Confirmar Depósito</span>
          </button>
        </div>
      </div>
      
      <!-- Tela de sucesso para PIX -->
      <div v-else class="card p-6">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold mb-2">PIX Gerado</h2>
          <p class="text-gray-400">
            Escaneie o QR Code abaixo ou copie o código PIX para realizar o pagamento.
          </p>
        </div>
        
        <div class="flex flex-col items-center mb-6">
          <div class="bg-white p-4 rounded-lg mb-4">
            <img :src="qrCodeUrl" alt="QR Code PIX" class="w-48 h-48" />
          </div>
          
          <div class="text-center">
            <p class="text-lg font-bold text-primary-500 mb-2">{{ formattedAmount }}</p>
            <p class="text-sm text-gray-400">O valor será creditado automaticamente após o pagamento.</p>
          </div>
        </div>
        
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-400 mb-1">Código PIX</label>
          <div class="flex">
            <input 
              type="text"
              class="input flex-grow rounded-r-none"
              :value="pixCode"
              readonly
            />
            <button 
              @click="copyPixCode"
              class="btn-primary rounded-l-none"
            >
              Copiar
            </button>
          </div>
        </div>
        
        <button 
          @click="resetForm"
          class="btn-outline w-full"
        >
          Voltar
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DepositView'
}
</script> 