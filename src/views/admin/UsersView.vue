<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// Dados simulados de usuários
const users = ref([
  { id: 1, name: 'João Silva', email: 'joao.silva@email.com', phone: '(11) 98765-4321', status: 'active', balance: 250.50, role: 'user', lastLogin: '2023-10-15 14:30' },
  { id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@email.com', phone: '(21) 98765-4321', status: 'active', balance: 120.75, role: 'user', lastLogin: '2023-10-14 09:15' },
  { id: 3, name: 'Pedro Santos', email: 'pedro.santos@email.com', phone: '(31) 98765-4321', status: 'inactive', balance: 0, role: 'user', lastLogin: '2023-09-30 16:45' },
  { id: 4, name: 'Ana Costa', email: 'ana.costa@email.com', phone: '(41) 98765-4321', status: 'active', balance: 75.25, role: 'moderator', lastLogin: '2023-10-15 11:20' },
  { id: 5, name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', phone: '(51) 98765-4321', status: 'blocked', balance: 0, role: 'user', lastLogin: '2023-10-10 08:30' },
  { id: 6, name: 'Juliana Almeida', email: 'juliana.almeida@email.com', phone: '(61) 98765-4321', status: 'active', balance: 320.00, role: 'admin', lastLogin: '2023-10-15 17:45' }
]);

const isLoading = ref(true);
const searchQuery = ref('');
const selectedStatus = ref('all');
const selectedRole = ref('all');

// Filtrar usuários
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Filtrar por texto de busca
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      user.phone.includes(searchQuery.value);
    
    // Filtrar por status
    const matchesStatus = selectedStatus.value === 'all' || user.status === selectedStatus.value;
    
    // Filtrar por função
    const matchesRole = selectedRole.value === 'all' || user.role === selectedRole.value;
    
    return matchesSearch && matchesStatus && matchesRole;
  });
});

// Opções de status
const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'blocked', label: 'Bloqueado' }
];

// Opções de função
const roleOptions = [
  { value: 'all', label: 'Todas as funções' },
  { value: 'user', label: 'Usuário' },
  { value: 'moderator', label: 'Moderador' },
  { value: 'admin', label: 'Administrador' }
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
    case 'blocked':
      return 'bg-red-900 text-red-300';
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
    case 'blocked':
      return 'Bloqueado';
    default:
      return status;
  }
}

// Obter texto para função
function getRoleText(role: string): string {
  switch (role) {
    case 'user':
      return 'Usuário';
    case 'moderator':
      return 'Moderador';
    case 'admin':
      return 'Administrador';
    default:
      return role;
  }
}

// Bloquear usuário
function blockUser(userId: number) {
  ElMessageBox.confirm(
    'Tem certeza que deseja bloquear este usuário?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, bloquear',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    // Simulação de bloqueio
    const userIndex = users.value.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users.value[userIndex].status = 'blocked';
      ElMessage.success('Usuário bloqueado com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Desbloquear usuário
function unblockUser(userId: number) {
  ElMessageBox.confirm(
    'Tem certeza que deseja desbloquear este usuário?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, desbloquear',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(() => {
    // Simulação de desbloqueio
    const userIndex = users.value.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
      users.value[userIndex].status = 'active';
      ElMessage.success('Usuário desbloqueado com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white mb-6">Gerenciamento de Usuários</h1>
    
    <!-- Filtros e busca -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Buscar usuário</label>
          <input 
            v-model="searchQuery"
            type="text"
            class="input w-full"
            placeholder="Nome, e-mail ou telefone"
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
        
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Função</label>
          <select v-model="selectedRole" class="input w-full">
            <option v-for="option in roleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
      </div>
    </div>
    
    <!-- Tabela de usuários -->
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-white">Lista de Usuários</h2>
        <span class="text-sm text-gray-400">{{ filteredUsers.length }} usuários encontrados</span>
      </div>
      
      <!-- Carregando -->
      <div v-if="isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p class="text-gray-400">Carregando usuários...</p>
      </div>
      
      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-700">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Função</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Saldo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Último Login</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                    {{ user.name.charAt(0) }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-white">{{ user.name }}</div>
                    <div class="text-sm text-gray-400">{{ user.email }}</div>
                    <div class="text-sm text-gray-400">{{ user.phone }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="getStatusClass(user.status)" 
                  class="px-2 py-1 rounded-full text-xs font-medium"
                >
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ getRoleText(user.role) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-white">
                {{ formatCurrency(user.balance) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {{ user.lastLogin }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    class="text-primary-500 hover:text-primary-400"
                    title="Editar usuário"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button 
                    v-if="user.status !== 'blocked'"
                    @click="blockUser(user.id)"
                    class="text-red-500 hover:text-red-400"
                    title="Bloquear usuário"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </button>
                  
                  <button 
                    v-else
                    @click="unblockUser(user.id)"
                    class="text-green-500 hover:text-green-400"
                    title="Desbloquear usuário"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Sem resultados -->
      <div v-if="!isLoading && filteredUsers.length === 0" class="p-8 text-center">
        <p class="text-gray-400">Nenhum usuário encontrado com os filtros selecionados.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed } from 'vue';

export default {
  name: 'UsersView'
}
</script> 