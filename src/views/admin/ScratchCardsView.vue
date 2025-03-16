<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Dados simulados de raspadinhas
const scratchCards = ref([
  { 
    id: 1, 
    name: 'Raspadinha Premium', 
    price: 5.00, 
    image: '/img/scratch-cards/premium.jpg',
    status: 'active',
    totalSold: 12500,
    revenue: 62500,
    winRate: 30,
    maxPrize: 1000,
    createdAt: '2023-01-15'
  },
  { 
    id: 2, 
    name: 'Raspadinha Especial', 
    price: 10.00, 
    image: '/img/scratch-cards/special.jpg',
    status: 'active',
    totalSold: 8200,
    revenue: 82000,
    winRate: 25,
    maxPrize: 5000,
    createdAt: '2023-03-20'
  },
  { 
    id: 3, 
    name: 'Raspadinha Básica', 
    price: 2.00, 
    image: '/img/scratch-cards/basic.jpg',
    status: 'inactive',
    totalSold: 15800,
    revenue: 31600,
    winRate: 35,
    maxPrize: 200,
    createdAt: '2023-05-10'
  },
  { 
    id: 4, 
    name: 'Raspadinha Diamante', 
    price: 20.00, 
    image: '/img/scratch-cards/diamond.jpg',
    status: 'active',
    totalSold: 3500,
    revenue: 70000,
    winRate: 20,
    maxPrize: 10000,
    createdAt: '2023-06-05'
  }
]);

const isLoading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('all');
const showAddCardModal = ref(false);
const showEditCardModal = ref(false);
const showPrizeConfigModal = ref(false);

// Nova raspadinha
const newCard = ref({
  name: '',
  price: 5.00,
  winRate: 30,
  maxPrize: 1000
});

// Raspadinha selecionada para edição
const selectedCard = ref<any>(null);

// Configuração de prêmios
const prizeConfig = ref([
  { value: 2, probability: 15 },
  { value: 5, probability: 8 },
  { value: 10, probability: 5 },
  { value: 20, probability: 1.5 },
  { value: 50, probability: 0.4 },
  { value: 100, probability: 0.1 }
]);

// Erros de validação
const errors = ref({
  name: '',
  price: '',
  winRate: '',
  maxPrize: ''
});

// Filtrar raspadinhas
const filteredCards = computed(() => {
  return scratchCards.value.filter(card => {
    // Filtrar por texto de busca
    const matchesSearch = 
      card.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtrar por status
    const matchesStatus = selectedStatus.value === 'all' || card.status === selectedStatus.value;
    
    return matchesSearch && matchesStatus;
  });
});

// Opções de status
const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' }
];

// Simular carregamento de dados
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false;
  }, 1000);
});

// Formatar valor monetário
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Obter classe de cor para status
function getStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-900 text-green-300';
    case 'inactive':
      return 'bg-yellow-900 text-yellow-300';
    default:
      return 'bg-gray-700 text-gray-300';
  }
}

// Obter texto para status
function getStatusText(status: string): string {
  switch (status) {
    case 'active':
      return 'Ativo';
    case 'inactive':
      return 'Inativo';
    default:
      return status;
  }
}

// Ativar raspadinha
function activateCard(cardId: number) {
  ElMessageBox.confirm(
    'Tem certeza que deseja ativar esta raspadinha?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    // Simulação de ativação
    const cardIndex = scratchCards.value.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      scratchCards.value[cardIndex].status = 'active';
      ElMessage.success('Raspadinha ativada com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Desativar raspadinha
function deactivateCard(cardId: number) {
  ElMessageBox.confirm(
    'Tem certeza que deseja desativar esta raspadinha?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, desativar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    // Simulação de desativação
    const cardIndex = scratchCards.value.findIndex(card => card.id === cardId);
    if (cardIndex !== -1) {
      scratchCards.value[cardIndex].status = 'inactive';
      ElMessage.success('Raspadinha desativada com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Abrir modal para adicionar raspadinha
function openAddCardModal() {
  showAddCardModal.value = true;
  resetNewCardForm();
}

// Abrir modal para editar raspadinha
function openEditCardModal(card: any) {
  selectedCard.value = { ...card };
  showEditCardModal.value = true;
}

// Abrir modal para configurar prêmios
function openPrizeConfigModal(card: any) {
  selectedCard.value = { ...card };
  showPrizeConfigModal.value = true;
}

// Fechar modais
function closeAddCardModal() {
  showAddCardModal.value = false;
}

function closeEditCardModal() {
  showEditCardModal.value = false;
  selectedCard.value = null;
}

function closePrizeConfigModal() {
  showPrizeConfigModal.value = false;
  selectedCard.value = null;
}

// Resetar formulário
function resetNewCardForm() {
  newCard.value = {
    name: '',
    price: 5.00,
    winRate: 30,
    maxPrize: 1000
  };
  
  errors.value = {
    name: '',
    price: '',
    winRate: '',
    maxPrize: ''
  };
}

// Validar formulário
function validateCardForm(card: any): boolean {
  let isValid = true;
  
  // Validar nome
  if (!card.name) {
    errors.value.name = 'Digite o nome da raspadinha';
    isValid = false;
  } else {
    errors.value.name = '';
  }
  
  // Validar preço
  if (card.price <= 0) {
    errors.value.price = 'O preço deve ser maior que zero';
    isValid = false;
  } else {
    errors.value.price = '';
  }
  
  // Validar taxa de vitória
  if (card.winRate < 1 || card.winRate > 100) {
    errors.value.winRate = 'A taxa de vitória deve estar entre 1% e 100%';
    isValid = false;
  } else {
    errors.value.winRate = '';
  }
  
  // Validar prêmio máximo
  if (card.maxPrize <= 0) {
    errors.value.maxPrize = 'O prêmio máximo deve ser maior que zero';
    isValid = false;
  } else {
    errors.value.maxPrize = '';
  }
  
  return isValid;
}

// Adicionar raspadinha
function addCard() {
  if (!validateCardForm(newCard.value)) return;
  
  // Simulação de adição de raspadinha
  const newId = Math.max(...scratchCards.value.map(c => c.id)) + 1;
  
  scratchCards.value.push({
    id: newId,
    name: newCard.value.name,
    price: newCard.value.price,
    image: '/img/scratch-cards/default.jpg',
    status: 'active',
    totalSold: 0,
    revenue: 0,
    winRate: newCard.value.winRate,
    maxPrize: newCard.value.maxPrize,
    createdAt: new Date().toISOString().split('T')[0]
  });
  
  ElMessage.success('Raspadinha adicionada com sucesso');
  closeAddCardModal();
}

// Atualizar raspadinha
function updateCard() {
  if (!selectedCard.value || !validateCardForm(selectedCard.value)) return;
  
  // Simulação de atualização de raspadinha
  const cardIndex = scratchCards.value.findIndex(card => card.id === selectedCard.value.id);
  if (cardIndex !== -1) {
    scratchCards.value[cardIndex] = { ...selectedCard.value };
    ElMessage.success('Raspadinha atualizada com sucesso');
    closeEditCardModal();
  }
}

// Calcular total de probabilidade
const totalProbability = computed(() => {
  return prizeConfig.value.reduce((sum, prize) => sum + prize.probability, 0);
});

// Adicionar novo prêmio à configuração
function addPrize() {
  prizeConfig.value.push({ value: 0, probability: 0 });
}

// Remover prêmio da configuração
function removePrize(index: number) {
  prizeConfig.value.splice(index, 1);
}

// Salvar configuração de prêmios
function savePrizeConfig() {
  // Aqui seria implementada a lógica para salvar a configuração de prêmios
  ElMessage.success('Configuração de prêmios salva com sucesso');
  closePrizeConfigModal();
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white mb-6">Gerenciamento de Raspadinhas</h1>
    
    <!-- Filtros e busca -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-end gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Buscar raspadinha</label>
            <input 
              v-model="searchQuery"
              type="text"
              class="input w-full"
              placeholder="Nome da raspadinha"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
            <select v-model="selectedStatus" class="input w-full">
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
        </div>
        
        <button 
          @click="openAddCardModal"
          class="btn-primary px-4 py-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar Raspadinha
        </button>
      </div>
    </div>
    
    <!-- Cards de raspadinhas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
      <div v-if="isLoading" v-for="i in 4" :key="i" class="bg-gray-800 rounded-lg p-4 animate-pulse">
        <div class="h-40 bg-gray-700 rounded mb-4"></div>
        <div class="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div class="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div class="h-8 bg-gray-700 rounded"></div>
      </div>
      
      <div 
        v-else
        v-for="card in filteredCards" 
        :key="card.id"
        class="bg-gray-800 rounded-lg overflow-hidden shadow-lg"
      >
        <div class="h-40 bg-gray-700 flex items-center justify-center">
          <div class="text-4xl">🎟️</div>
        </div>
        
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-semibold text-white">{{ card.name }}</h3>
            <span 
              :class="getStatusClass(card.status)" 
              class="px-2 py-1 rounded-full text-xs font-medium"
            >
              {{ getStatusText(card.status) }}
            </span>
          </div>
          
          <div class="text-xl font-bold text-primary-500 mb-2">
            {{ formatCurrency(card.price) }}
          </div>
          
          <div class="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
            <div>Taxa de Vitória:</div>
            <div class="text-right">{{ card.winRate }}%</div>
            
            <div>Prêmio Máximo:</div>
            <div class="text-right">{{ formatCurrency(card.maxPrize) }}</div>
            
            <div>Total Vendido:</div>
            <div class="text-right">{{ card.totalSold.toLocaleString() }}</div>
            
            <div>Receita:</div>
            <div class="text-right">{{ formatCurrency(card.revenue) }}</div>
          </div>
          
          <div class="flex justify-between">
            <button 
              @click="openEditCardModal(card)"
              class="btn-outline py-1 px-2 text-sm"
            >
              Editar
            </button>
            
            <button 
              @click="openPrizeConfigModal(card)"
              class="btn-outline py-1 px-2 text-sm"
            >
              Configurar Prêmios
            </button>
            
            <button 
              v-if="card.status === 'inactive'"
              @click="activateCard(card.id)"
              class="btn-success py-1 px-2 text-sm"
            >
              Ativar
            </button>
            
            <button 
              v-else
              @click="deactivateCard(card.id)"
              class="btn-warning py-1 px-2 text-sm"
            >
              Desativar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Sem resultados -->
      <div v-if="!isLoading && filteredCards.length === 0" class="col-span-full p-8 text-center bg-gray-800 rounded-lg">
        <p class="text-gray-400">Nenhuma raspadinha encontrada com os filtros selecionados.</p>
      </div>
    </div>
    
    <!-- Modal para adicionar raspadinha -->
    <div v-if="showAddCardModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-lg font-semibold text-white">Adicionar Nova Raspadinha</h3>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Nome da Raspadinha</label>
            <input 
              v-model="newCard.name"
              type="text"
              class="input w-full"
              placeholder="Ex: Raspadinha Premium"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Preço (R$)</label>
            <input 
              v-model.number="newCard.price"
              type="number"
              min="0.01"
              step="0.01"
              class="input w-full"
              :class="{ 'border-red-500': errors.price }"
            />
            <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Taxa de Vitória (%)</label>
            <input 
              v-model.number="newCard.winRate"
              type="number"
              min="1"
              max="100"
              class="input w-full"
              :class="{ 'border-red-500': errors.winRate }"
            />
            <p v-if="errors.winRate" class="text-red-500 text-sm mt-1">{{ errors.winRate }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Prêmio Máximo (R$)</label>
            <input 
              v-model.number="newCard.maxPrize"
              type="number"
              min="1"
              step="1"
              class="input w-full"
              :class="{ 'border-red-500': errors.maxPrize }"
            />
            <p v-if="errors.maxPrize" class="text-red-500 text-sm mt-1">{{ errors.maxPrize }}</p>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button 
            @click="closeAddCardModal"
            class="btn-outline"
          >
            Cancelar
          </button>
          <button 
            @click="addCard"
            class="btn-primary"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal para editar raspadinha -->
    <div v-if="showEditCardModal && selectedCard" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-lg font-semibold text-white">Editar Raspadinha</h3>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Nome da Raspadinha</label>
            <input 
              v-model="selectedCard.name"
              type="text"
              class="input w-full"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Preço (R$)</label>
            <input 
              v-model.number="selectedCard.price"
              type="number"
              min="0.01"
              step="0.01"
              class="input w-full"
              :class="{ 'border-red-500': errors.price }"
            />
            <p v-if="errors.price" class="text-red-500 text-sm mt-1">{{ errors.price }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Taxa de Vitória (%)</label>
            <input 
              v-model.number="selectedCard.winRate"
              type="number"
              min="1"
              max="100"
              class="input w-full"
              :class="{ 'border-red-500': errors.winRate }"
            />
            <p v-if="errors.winRate" class="text-red-500 text-sm mt-1">{{ errors.winRate }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Prêmio Máximo (R$)</label>
            <input 
              v-model.number="selectedCard.maxPrize"
              type="number"
              min="1"
              step="1"
              class="input w-full"
              :class="{ 'border-red-500': errors.maxPrize }"
            />
            <p v-if="errors.maxPrize" class="text-red-500 text-sm mt-1">{{ errors.maxPrize }}</p>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button 
            @click="closeEditCardModal"
            class="btn-outline"
          >
            Cancelar
          </button>
          <button 
            @click="updateCard"
            class="btn-primary"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal para configurar prêmios -->
    <div v-if="showPrizeConfigModal && selectedCard" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-lg font-semibold text-white">Configurar Prêmios - {{ selectedCard.name }}</h3>
        </div>
        
        <div class="p-6">
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium text-white">Tabela de Prêmios</h4>
              <div class="text-sm text-gray-400">
                Total de probabilidade: <span :class="totalProbability > 100 ? 'text-red-500' : 'text-green-500'">{{ totalProbability.toFixed(1) }}%</span>
              </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
              <div class="grid grid-cols-12 gap-4 mb-2 text-sm font-medium text-gray-300">
                <div class="col-span-5">Valor do Prêmio (R$)</div>
                <div class="col-span-5">Probabilidade (%)</div>
                <div class="col-span-2 text-right">Ações</div>
              </div>
              
              <div v-for="(prize, index) in prizeConfig" :key="index" class="grid grid-cols-12 gap-4 mb-2">
                <div class="col-span-5">
                  <input 
                    v-model.number="prize.value"
                    type="number"
                    min="0"
                    step="1"
                    class="input w-full"
                  />
                </div>
                <div class="col-span-5">
                  <input 
                    v-model.number="prize.probability"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="input w-full"
                  />
                </div>
                <div class="col-span-2 flex justify-end">
                  <button 
                    @click="removePrize(index)"
                    class="text-red-500 hover:text-red-400"
                    title="Remover prêmio"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <button 
                @click="addPrize"
                class="mt-2 text-primary-500 hover:text-primary-400 text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Adicionar Prêmio
              </button>
            </div>
            
            <div class="mt-4 text-sm text-gray-400">
              <p>A soma das probabilidades deve ser igual ou menor que 100%.</p>
              <p>O restante será considerado como "sem prêmio".</p>
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button 
            @click="closePrizeConfigModal"
            class="btn-outline"
          >
            Cancelar
          </button>
          <button 
            @click="savePrizeConfig"
            class="btn-primary"
            :disabled="totalProbability > 100"
          >
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ScratchCardsView'
}
</script> 