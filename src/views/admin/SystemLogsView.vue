<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useSystemLogStore } from '../../stores/systemLog';
import { useAdminStore } from '../../stores/admin';
import type { SystemLog, LogFilters } from '../../types/system';
import { LogType } from '../../types/system';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Stores
const systemLogStore = useSystemLogStore();
const adminStore = useAdminStore();

// Estado local
const selectedLog = ref<SystemLog | null>(null);
const showLogDetails = ref(false);
const resolutionNotes = ref('');
const searchQuery = ref('');
const selectedType = ref<string>('');
const selectedSource = ref<string>('');
const selectedResolved = ref<string>('');
const startDate = ref('');
const endDate = ref('');
const showFilters = ref(false);

// Computed properties
const logs = computed(() => systemLogStore.logs);
const isLoading = computed(() => systemLogStore.isLoading);
const pagination = computed(() => systemLogStore.pagination);
const isSuperAdmin = computed(() => adminStore.admin?.role === 'super_admin');
const uniqueSources = computed(() => {
  const sources = new Set<string>();
  logs.value.forEach(log => sources.add(log.source));
  return Array.from(sources);
});

// Formatar data
function formatDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
}

// Obter classe de cor com base no tipo de log
function getLogTypeClass(type: string): string {
  switch (type) {
    case LogType.ERROR:
      return 'bg-red-900 text-red-100';
    case LogType.WARNING:
      return 'bg-yellow-900 text-yellow-100';
    case LogType.INFO:
      return 'bg-blue-900 text-blue-100';
    default:
      return 'bg-gray-700 text-gray-100';
  }
}

// Obter ícone com base no tipo de log
function getLogTypeIcon(type: string): string {
  switch (type) {
    case LogType.ERROR:
      return 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z';
    case LogType.WARNING:
      return 'M12 9v3.75m9.303-3.376c-.866 1.5.217 3.374 1.948 3.374h1.401c.809 0 1.466-.676 1.466-1.5 0-1.5-.672-1.5-1.466-1.5h-1.401c-1.73 0-2.813 1.874-1.948 3.374L18.303 18.75c.866 1.5 3.032 1.5 3.898 0l2.414-4.178c.866-1.5-.217-3.374-1.948-3.374h-1.401c-.809 0-1.466.676-1.466 1.5';
    case LogType.INFO:
      return 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z';
    default:
      return 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z';
  }
}

// Abrir detalhes do log
function openLogDetails(log: SystemLog) {
  selectedLog.value = log;
  showLogDetails.value = true;
  resolutionNotes.value = '';
}

// Fechar detalhes do log
function closeLogDetails() {
  showLogDetails.value = false;
  selectedLog.value = null;
}

// Marcar log como resolvido
async function resolveLog() {
  if (!selectedLog.value) return;
  
  const success = await systemLogStore.resolveLog(selectedLog.value.id, resolutionNotes.value);
  
  if (success) {
    closeLogDetails();
  }
}

// Aplicar filtros
function applyFilters() {
  const filters: LogFilters = {
    page: 1
  };
  
  if (searchQuery.value) {
    filters.search = searchQuery.value;
  }
  
  if (selectedType.value) {
    filters.type = selectedType.value as LogType;
  }
  
  if (selectedSource.value) {
    filters.source = selectedSource.value;
  }
  
  if (selectedResolved.value === 'true') {
    filters.resolved = true;
  } else if (selectedResolved.value === 'false') {
    filters.resolved = false;
  }
  
  if (startDate.value) {
    filters.startDate = startDate.value;
  }
  
  if (endDate.value) {
    filters.endDate = endDate.value;
  }
  
  systemLogStore.fetchLogs(filters);
}

// Limpar filtros
function clearFilters() {
  searchQuery.value = '';
  selectedType.value = '';
  selectedSource.value = '';
  selectedResolved.value = '';
  startDate.value = '';
  endDate.value = '';
  
  systemLogStore.fetchLogs({ page: 1 });
}

// Limpar logs antigos
async function cleanupOldLogs() {
  if (confirm('Tem certeza que deseja excluir todos os logs com mais de 90 dias? Esta ação não pode ser desfeita.')) {
    const message = await systemLogStore.cleanupOldLogs();
    if (message) {
      alert(message);
    }
  }
}

// Mudar página
function changePage(page: number) {
  if (page < 1 || page > pagination.value.pages) return;
  systemLogStore.fetchLogs({ page });
}

// Carregar logs ao montar o componente
onMounted(() => {
  systemLogStore.fetchLogs();
});
</script>

<template>
  <div>
    <!-- Cabeçalho da seção -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-semibold text-white">Logs do Sistema</h2>
        <p class="text-gray-400 mt-1">Monitore erros e eventos do sistema</p>
      </div>
      
      <div class="flex space-x-2">
        <button 
          @click="showFilters = !showFilters"
          class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
        </button>
        
        <button 
          v-if="isSuperAdmin"
          @click="cleanupOldLogs"
          class="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Limpar Logs Antigos
        </button>
      </div>
    </div>
    
    <!-- Filtros -->
    <div v-if="showFilters" class="mb-6 bg-gray-800 p-4 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Buscar</label>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Buscar em mensagens..."
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
          <select 
            v-model="selectedType"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos os tipos</option>
            <option value="error">Erro</option>
            <option value="warning">Aviso</option>
            <option value="info">Informação</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Origem</label>
          <select 
            v-model="selectedSource"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todas as origens</option>
            <option v-for="source in uniqueSources" :key="source" :value="source">{{ source }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Status</label>
          <select 
            v-model="selectedResolved"
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="false">Não resolvidos</option>
            <option value="true">Resolvidos</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Data Inicial</label>
          <input 
            v-model="startDate" 
            type="date" 
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Data Final</label>
          <input 
            v-model="endDate" 
            type="date" 
            class="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>
      
      <div class="mt-4 flex justify-end space-x-3">
        <button 
          @click="clearFilters"
          class="px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
        >
          Limpar Filtros
        </button>
        <button 
          @click="applyFilters"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
    
    <!-- Tabela de logs -->
    <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Tipo
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Origem
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Mensagem
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-gray-800 divide-y divide-gray-700">
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="logs.length === 0">
              <td colspan="6" class="px-6 py-4 whitespace-nowrap text-center text-gray-400">
                Nenhum log encontrado
              </td>
            </tr>
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-700 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 py-1 text-xs font-medium rounded-full', getLogTypeClass(log.type)]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getLogTypeIcon(log.type)" />
                  </svg>
                  {{ log.type.toUpperCase() }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ log.source }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-300 truncate max-w-xs">
                {{ log.message }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(log.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="log.resolved ? 'bg-green-900 text-green-100' : 'bg-yellow-900 text-yellow-100'"
                >
                  {{ log.resolved ? 'Resolvido' : 'Pendente' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  @click="openLogDetails(log)"
                  class="text-primary-400 hover:text-primary-300 mr-3"
                >
                  Detalhes
                </button>
                <button 
                  v-if="!log.resolved"
                  @click="openLogDetails(log)"
                  class="text-green-400 hover:text-green-300"
                >
                  Resolver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <div class="px-6 py-4 bg-gray-700 flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Mostrando {{ logs.length }} de {{ pagination.total }} logs
        </div>
        <div class="flex space-x-2">
          <button 
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span class="px-3 py-1 bg-primary-600 text-white rounded-md">
            {{ pagination.page }}
          </span>
          <button 
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
    
    <!-- Modal de detalhes do log -->
    <div 
      v-if="showLogDetails && selectedLog" 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-semibold text-white">Detalhes do Log</h3>
            <button 
              @click="closeLogDetails"
              class="p-2 rounded-md hover:bg-gray-700 transition-colors text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="space-y-6">
            <!-- Informações básicas -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-1">ID</h4>
                <p class="text-white">{{ selectedLog.id }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-1">Tipo</h4>
                <p>
                  <span :class="['px-2 py-1 text-xs font-medium rounded-full', getLogTypeClass(selectedLog.type)]">
                    {{ selectedLog.type.toUpperCase() }}
                  </span>
                </p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-1">Origem</h4>
                <p class="text-white">{{ selectedLog.source }}</p>
              </div>
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-1">Data</h4>
                <p class="text-white">{{ formatDate(selectedLog.createdAt) }}</p>
              </div>
              <div class="col-span-2">
                <h4 class="text-sm font-medium text-gray-400 mb-1">Mensagem</h4>
                <p class="text-white">{{ selectedLog.message }}</p>
              </div>
            </div>
            
            <!-- Detalhes do log -->
            <div>
              <h4 class="text-sm font-medium text-gray-400 mb-2">Detalhes</h4>
              <div class="bg-gray-900 p-4 rounded-md overflow-x-auto">
                <pre class="text-white text-sm whitespace-pre-wrap">{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
              </div>
            </div>
            
            <!-- Informações de resolução -->
            <div v-if="selectedLog.resolved">
              <h4 class="text-sm font-medium text-gray-400 mb-2">Informações de Resolução</h4>
              <div class="bg-gray-700 p-4 rounded-md">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 class="text-xs font-medium text-gray-400 mb-1">Resolvido em</h5>
                    <p class="text-white">{{ formatDate(selectedLog.resolvedAt || '') }}</p>
                  </div>
                  <div>
                    <h5 class="text-xs font-medium text-gray-400 mb-1">Resolvido por</h5>
                    <p class="text-white">{{ selectedLog.resolvedBy || 'N/A' }}</p>
                  </div>
                  <div class="col-span-2">
                    <h5 class="text-xs font-medium text-gray-400 mb-1">Notas de Resolução</h5>
                    <p class="text-white">{{ selectedLog.resolutionNotes || 'Nenhuma nota fornecida' }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Formulário de resolução -->
            <div v-if="!selectedLog.resolved">
              <h4 class="text-sm font-medium text-gray-400 mb-2">Resolver este Log</h4>
              <div class="bg-gray-700 p-4 rounded-md">
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-300 mb-1">Notas de Resolução</label>
                  <textarea 
                    v-model="resolutionNotes" 
                    rows="3"
                    class="w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Descreva como o problema foi resolvido..."
                  ></textarea>
                </div>
                <div class="flex justify-end">
                  <button 
                    @click="resolveLog"
                    class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
                  >
                    Marcar como Resolvido
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SystemLogsView'
}
</script> 