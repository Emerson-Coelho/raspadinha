<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Dados simulados de parceiros
const partners = ref([
  { 
    id: 1, 
    name: 'Parceiro Premium', 
    domain: 'premium.raspadinha.com.br', 
    logo: '/img/partners/premium-logo.png', 
    status: 'active', 
    users: 1250, 
    revenue: 25000, 
    commission: 15, 
    createdAt: '2023-01-15'
  },
  { 
    id: 2, 
    name: 'Parceiro Gold', 
    domain: 'gold.raspadinha.com.br', 
    logo: '/img/partners/gold-logo.png', 
    status: 'active', 
    users: 850, 
    revenue: 18500, 
    commission: 12, 
    createdAt: '2023-03-20'
  },
  { 
    id: 3, 
    name: 'Parceiro Silver', 
    domain: 'silver.raspadinha.com.br', 
    logo: '/img/partners/silver-logo.png', 
    status: 'inactive', 
    users: 320, 
    revenue: 7500, 
    commission: 10, 
    createdAt: '2023-05-10'
  },
  { 
    id: 4, 
    name: 'Parceiro Bronze', 
    domain: 'bronze.raspadinha.com.br', 
    logo: '/img/partners/bronze-logo.png', 
    status: 'active', 
    users: 450, 
    revenue: 9200, 
    commission: 8, 
    createdAt: '2023-06-05'
  }
]);

const isLoading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('all');
const showAddPartnerModal = ref(false);

// Novo parceiro
const newPartner = ref({
  name: '',
  domain: '',
  commission: 10
});

// Erros de validação
const errors = ref({
  name: '',
  domain: '',
  commission: ''
});

// Filtrar parceiros
const filteredPartners = computed(() => {
  return partners.value.filter(partner => {
    // Filtrar por texto de busca
    const matchesSearch = 
      partner.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      partner.domain.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    // Filtrar por status
    const matchesStatus = selectedStatus.value === 'all' || partner.status === selectedStatus.value;
    
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

// Ativar parceiro
function activatePartner(partnerId: number) {
  ElMessageBox.confirm(
    'Tem certeza que deseja ativar este parceiro?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    // Simulação de ativação
    const partnerIndex = partners.value.findIndex(partner => partner.id === partnerId);
    if (partnerIndex !== -1) {
      partners.value[partnerIndex].status = 'active';
      ElMessage.success('Parceiro ativado com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Desativar parceiro
function deactivatePartner(partnerId: number) {
  ElMessageBox.confirm(
    'Tem certeza que deseja desativar este parceiro?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, desativar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    // Simulação de desativação
    const partnerIndex = partners.value.findIndex(partner => partner.id === partnerId);
    if (partnerIndex !== -1) {
      partners.value[partnerIndex].status = 'inactive';
      ElMessage.success('Parceiro desativado com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Abrir modal para adicionar parceiro
function openAddPartnerModal() {
  showAddPartnerModal.value = true;
  resetNewPartnerForm();
}

// Fechar modal
function closeAddPartnerModal() {
  showAddPartnerModal.value = false;
}

// Resetar formulário
function resetNewPartnerForm() {
  newPartner.value = {
    name: '',
    domain: '',
    commission: 10
  };
  
  errors.value = {
    name: '',
    domain: '',
    commission: ''
  };
}

// Validar formulário
function validatePartnerForm(): boolean {
  let isValid = true;
  
  // Validar nome
  if (!newPartner.value.name) {
    errors.value.name = 'Digite o nome do parceiro';
    isValid = false;
  } else {
    errors.value.name = '';
  }
  
  // Validar domínio
  if (!newPartner.value.domain) {
    errors.value.domain = 'Digite o domínio do parceiro';
    isValid = false;
  } else if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(newPartner.value.domain)) {
    errors.value.domain = 'Domínio inválido';
    isValid = false;
  } else {
    errors.value.domain = '';
  }
  
  // Validar comissão
  if (newPartner.value.commission < 0 || newPartner.value.commission > 50) {
    errors.value.commission = 'A comissão deve estar entre 0% e 50%';
    isValid = false;
  } else {
    errors.value.commission = '';
  }
  
  return isValid;
}

// Adicionar parceiro
function addPartner() {
  if (!validatePartnerForm()) return;
  
  // Simulação de adição de parceiro
  const newId = Math.max(...partners.value.map(p => p.id)) + 1;
  
  partners.value.push({
    id: newId,
    name: newPartner.value.name,
    domain: newPartner.value.domain,
    logo: '/img/partners/default-logo.png',
    status: 'active',
    users: 0,
    revenue: 0,
    commission: newPartner.value.commission,
    createdAt: new Date().toISOString().split('T')[0]
  });
  
  ElMessage.success('Parceiro adicionado com sucesso');
  closeAddPartnerModal();
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white mb-6">Gerenciamento de Parceiros</h1>
    
    <!-- Filtros e busca -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <div class="flex flex-col md:flex-row justify-between items-end gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Buscar parceiro</label>
            <input 
              v-model="searchQuery"
              type="text"
              class="input w-full"
              placeholder="Nome ou domínio"
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
          @click="openAddPartnerModal"
          class="btn-primary px-4 py-2 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Adicionar Parceiro
        </button>
      </div>
    </div>
    
    <!-- Tabela de parceiros -->
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-white">Lista de Parceiros</h2>
        <span class="text-sm text-gray-400">{{ filteredPartners.length }} parceiros encontrados</span>
      </div>
      
      <!-- Carregando -->
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p class="text-gray-400">Carregando parceiros...</p>
      </div>
      
      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-700">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Parceiro</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuários</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Receita</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Comissão</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data de Criação</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="partner in filteredPartners" :key="partner.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded bg-gray-600 flex items-center justify-center text-white font-medium">
                    {{ partner.name.charAt(0) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">{{ partner.name }}</div>
                    <div class="text-sm text-gray-400">{{ partner.domain }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(partner.status)" 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusText(partner.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ partner.users.toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ formatCurrency(partner.revenue) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ partner.commission }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {{ partner.createdAt }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    class="text-primary-500 hover:text-primary-400"
                    title="Editar parceiro"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button 
                    v-if="partner.status === 'inactive'"
                    @click="activatePartner(partner.id)"
                    class="text-green-500 hover:text-green-400"
                    title="Ativar parceiro"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  
                  <button 
                    v-else
                    @click="deactivatePartner(partner.id)"
                    class="text-yellow-500 hover:text-yellow-400"
                    title="Desativar parceiro"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Sem resultados -->
      <div v-if="!isLoading && filteredPartners.length === 0" class="p-8 text-center">
        <p class="text-gray-400">Nenhum parceiro encontrado com os filtros selecionados.</p>
      </div>
    </div>
    
    <!-- Modal para adicionar parceiro -->
    <div v-if="showAddPartnerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-gray-800 rounded-lg shadow-lg w-full max-w-md">
        <div class="p-6 border-b border-gray-700">
          <h3 class="text-lg font-semibold text-white">Adicionar Novo Parceiro</h3>
        </div>
        
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Nome do Parceiro</label>
            <input 
              v-model="newPartner.name"
              type="text"
              class="input w-full"
              placeholder="Ex: Parceiro Premium"
              :class="{ 'border-red-500': errors.name }"
            />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Domínio</label>
            <input 
              v-model="newPartner.domain"
              type="text"
              class="input w-full"
              placeholder="Ex: parceiro.raspadinha.com.br"
              :class="{ 'border-red-500': errors.domain }"
            />
            <p v-if="errors.domain" class="text-red-500 text-sm mt-1">{{ errors.domain }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-1">Comissão (%)</label>
            <input 
              v-model.number="newPartner.commission"
              type="number"
              min="0"
              max="50"
              class="input w-full"
              :class="{ 'border-red-500': errors.commission }"
            />
            <p v-if="errors.commission" class="text-red-500 text-sm mt-1">{{ errors.commission }}</p>
          </div>
        </div>
        
        <div class="p-6 border-t border-gray-700 flex justify-end space-x-3">
          <button 
            @click="closeAddPartnerModal"
            class="btn-outline"
          >
            Cancelar
          </button>
          <button 
            @click="addPartner"
            class="btn-primary"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'PartnersView'
}
</script> 