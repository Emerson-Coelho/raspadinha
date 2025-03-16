<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Gerenciamento de Sorteios</h1>
      <button 
        @click="openModal()" 
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <span class="mr-2">Novo Sorteio</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Filtros -->
    <div class="bg-white shadow rounded-lg p-4 mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.status" class="w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="">Todos</option>
            <option value="scheduled">Agendados</option>
            <option value="active">Ativos</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input 
            type="date" 
            v-model="filters.startDate" 
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          >
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <input 
            type="date" 
            v-model="filters.endDate" 
            class="w-full border border-gray-300 rounded-md px-3 py-2"
          >
        </div>
        <div class="flex items-end">
          <button 
            @click="applyFilters" 
            class="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
          >
            Filtrar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabela de Sorteios -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">Carregando sorteios...</p>
      </div>

      <div v-else-if="draws.length === 0" class="p-6 text-center">
        <p class="text-gray-600">Nenhum sorteio encontrado.</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data do Sorteio</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prêmio</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="draw in draws" :key="draw.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ draw.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ draw.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(draw.drawDate) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatCurrency(draw.prize) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" 
                :class="getStatusClass(draw.status)"
              >
                {{ getStatusText(draw.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ draw.participants }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button 
                  @click="editDraw(draw)" 
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Editar
                </button>
                <button 
                  v-if="draw.status === 'scheduled'" 
                  @click="startDraw(draw.id)" 
                  class="text-green-600 hover:text-green-900"
                >
                  Iniciar
                </button>
                <button 
                  v-if="draw.status === 'active'" 
                  @click="completeDraw(draw.id)" 
                  class="text-blue-600 hover:text-blue-900"
                >
                  Concluir
                </button>
                <button 
                  v-if="['scheduled', 'active'].includes(draw.status)" 
                  @click="confirmDelete(draw)" 
                  class="text-red-600 hover:text-red-900"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal para Criar/Editar Sorteio -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="flex justify-between items-center p-4 border-b">
          <h3 class="text-lg font-medium">{{ isEditing ? 'Editar Sorteio' : 'Novo Sorteio' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveDraw">
          <div class="p-4">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Sorteio</label>
              <input 
                type="text" 
                v-model="currentDraw.name" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              >
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea 
                v-model="currentDraw.description" 
                rows="3"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              ></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Data do Sorteio</label>
              <input 
                type="datetime-local" 
                v-model="currentDraw.drawDate" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              >
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Valor do Prêmio (R$)</label>
              <input 
                type="number" 
                v-model="currentDraw.prize" 
                required
                min="0"
                step="0.01"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              >
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Número Máximo de Participantes</label>
              <input 
                type="number" 
                v-model="currentDraw.maxParticipants" 
                required
                min="1"
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              >
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                v-model="currentDraw.status" 
                required
                class="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="scheduled">Agendado</option>
                <option value="active">Ativo</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6 rounded-b-lg">
            <button 
              type="button" 
              @click="closeModal" 
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              class="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de Confirmação para Excluir -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-medium mb-4">Confirmar Exclusão</h3>
          <p class="text-gray-600 mb-6">Tem certeza que deseja excluir o sorteio "{{ deleteDrawName }}"? Esta ação não pode ser desfeita.</p>
          <div class="flex justify-end">
            <button 
              @click="cancelDelete" 
              class="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-2"
            >
              Cancelar
            </button>
            <button 
              @click="deleteDraw" 
              class="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Tipos
interface Draw {
  id: number;
  name: string;
  description: string;
  drawDate: string;
  prize: number;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  participants: number;
  maxParticipants: number;
}

// Estado
const draws = ref<Draw[]>([]);
const loading = ref(true);
const filters = ref({
  status: '',
  startDate: '',
  endDate: ''
});
const showModal = ref(false);
const showDeleteModal = ref(false);
const isEditing = ref(false);
const deleteDrawId = ref<number | null>(null);
const deleteDrawName = ref('');

// Sorteio atual para edição/criação
const currentDraw = ref<Draw>({
  id: 0,
  name: '',
  description: '',
  drawDate: '',
  prize: 0,
  status: 'scheduled',
  participants: 0,
  maxParticipants: 100
});

// Dados de exemplo para demonstração
const mockDraws: Draw[] = [
  {
    id: 1,
    name: 'Sorteio de Natal',
    description: 'Grande sorteio de fim de ano com prêmios especiais',
    drawDate: '2023-12-24T20:00:00',
    prize: 5000,
    status: 'scheduled',
    participants: 78,
    maxParticipants: 500
  },
  {
    id: 2,
    name: 'Sorteio Semanal',
    description: 'Sorteio semanal com prêmios em dinheiro',
    drawDate: '2023-06-10T18:00:00',
    prize: 1000,
    status: 'active',
    participants: 120,
    maxParticipants: 200
  },
  {
    id: 3,
    name: 'Sorteio Relâmpago',
    description: 'Sorteio rápido com duração de apenas 24 horas',
    drawDate: '2023-05-15T12:00:00',
    prize: 500,
    status: 'completed',
    participants: 150,
    maxParticipants: 150
  }
];

// Métodos
const fetchDraws = () => {
  loading.value = true;
  
  // Simulando uma chamada de API
  setTimeout(() => {
    // Aplicar filtros
    let filteredDraws = [...mockDraws];
    
    if (filters.value.status) {
      filteredDraws = filteredDraws.filter(draw => draw.status === filters.value.status);
    }
    
    if (filters.value.startDate) {
      const startDate = new Date(filters.value.startDate);
      filteredDraws = filteredDraws.filter(draw => new Date(draw.drawDate) >= startDate);
    }
    
    if (filters.value.endDate) {
      const endDate = new Date(filters.value.endDate);
      endDate.setHours(23, 59, 59);
      filteredDraws = filteredDraws.filter(draw => new Date(draw.drawDate) <= endDate);
    }
    
    draws.value = filteredDraws;
    loading.value = false;
  }, 500);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'scheduled': 'Agendado',
    'active': 'Ativo',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
};

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    'scheduled': 'bg-yellow-100 text-yellow-800',
    'active': 'bg-green-100 text-green-800',
    'completed': 'bg-blue-100 text-blue-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return classMap[status] || '';
};

const openModal = () => {
  isEditing.value = false;
  currentDraw.value = {
    id: 0,
    name: '',
    description: '',
    drawDate: '',
    prize: 0,
    status: 'scheduled',
    participants: 0,
    maxParticipants: 100
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const editDraw = (draw: Draw) => {
  isEditing.value = true;
  currentDraw.value = { ...draw };
  showModal.value = true;
};

const saveDraw = () => {
  // Simulando salvamento
  if (isEditing.value) {
    const index = mockDraws.findIndex(d => d.id === currentDraw.value.id);
    if (index !== -1) {
      mockDraws[index] = { ...currentDraw.value };
    }
  } else {
    const newId = Math.max(0, ...mockDraws.map(d => d.id)) + 1;
    mockDraws.push({
      ...currentDraw.value,
      id: newId,
      participants: 0
    });
  }
  
  closeModal();
  fetchDraws();
};

const confirmDelete = (draw: Draw) => {
  deleteDrawId.value = draw.id;
  deleteDrawName.value = draw.name;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  deleteDrawId.value = null;
  deleteDrawName.value = '';
  showDeleteModal.value = false;
};

const deleteDraw = () => {
  if (deleteDrawId.value) {
    const index = mockDraws.findIndex(d => d.id === deleteDrawId.value);
    if (index !== -1) {
      mockDraws.splice(index, 1);
    }
  }
  
  cancelDelete();
  fetchDraws();
};

const startDraw = (id: number) => {
  const index = mockDraws.findIndex(d => d.id === id);
  if (index !== -1) {
    mockDraws[index].status = 'active';
    fetchDraws();
  }
};

const completeDraw = (id: number) => {
  const index = mockDraws.findIndex(d => d.id === id);
  if (index !== -1) {
    mockDraws[index].status = 'completed';
    fetchDraws();
  }
};

const applyFilters = () => {
  fetchDraws();
};

// Inicialização
onMounted(() => {
  fetchDraws();
});
</script>

<style scoped>
/* Estilos específicos para a página de gerenciamento de sorteios */
</style>
