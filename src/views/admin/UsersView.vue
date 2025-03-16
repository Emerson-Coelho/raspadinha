<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox, ElDatePicker } from 'element-plus';
import { useAdminUsersStore } from '../../stores/admin-users';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interface para os filtros
interface UserFilters {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  role?: string;
  status?: string;
  minBalance?: number;
  maxBalance?: number;
  createdAfter?: string;
  createdBefore?: string;
  lastLoginAfter?: string;
  lastLoginBefore?: string;
}

// Store de usuários
const adminUsersStore = useAdminUsersStore();

// Estado local
const isFilterPanelOpen = ref(false);
const filters = reactive<UserFilters>({
  name: '',
  email: '',
  cpf: '',
  phone: '',
  role: '',
  status: '',
  minBalance: undefined,
  maxBalance: undefined,
  createdAfter: undefined,
  createdBefore: undefined,
  lastLoginAfter: undefined,
  lastLoginBefore: undefined
});

// Opções de status
const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'suspended', label: 'Suspenso' }
];

// Opções de função
const roleOptions = [
  { value: '', label: 'Todas as funções' },
  { value: 'user', label: 'Usuário' },
  { value: 'vip', label: 'VIP' }
];

// Opções de itens por página
const pageSizeOptions = [
  { value: 10, label: '10 por página' },
  { value: 20, label: '20 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' }
];

// Opções de ordenação
const sortOptions = [
  { field: 'createdAt', label: 'Data de cadastro', order: 'desc' },
  { field: 'name', label: 'Nome', order: 'asc' },
  { field: 'email', label: 'Email', order: 'asc' },
  { field: 'balance', label: 'Saldo', order: 'desc' },
  { field: 'lastLogin', label: 'Último login', order: 'desc' }
];

// Ordenação atual
const currentSort = reactive({
  field: 'createdAt',
  order: 'desc' as 'asc' | 'desc'
});

// Carregar usuários ao montar o componente
onMounted(() => {
  adminUsersStore.fetchUsers();
});

// Aplicar filtros
function applyFilters() {
  adminUsersStore.setFilters(filters);
  isFilterPanelOpen.value = false;
}

// Limpar filtros
function clearFilters() {
  // Resetar todos os filtros
  filters.name = '';
  filters.email = '';
  filters.cpf = '';
  filters.phone = '';
  filters.role = '';
  filters.status = '';
  filters.minBalance = undefined;
  filters.maxBalance = undefined;
  filters.createdAfter = undefined;
  filters.createdBefore = undefined;
  filters.lastLoginAfter = undefined;
  filters.lastLoginBefore = undefined;
  
  adminUsersStore.clearFilters();
  isFilterPanelOpen.value = false;
}

// Mudar página
function changePage(page: number) {
  adminUsersStore.setPage(page);
}

// Mudar itens por página
function changePageSize(size: number) {
  adminUsersStore.setLimit(size);
}

// Mudar ordenação
function changeSort(field: string) {
  if (currentSort.field === field) {
    // Inverter a ordem se o campo já estiver selecionado
    currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
  } else {
    // Definir o novo campo e ordem padrão
    currentSort.field = field;
    const option = sortOptions.find(opt => opt.field === field);
    currentSort.order = option ? option.order as 'asc' | 'desc' : 'asc';
  }
  
  adminUsersStore.setSorting(currentSort.field, currentSort.order);
}

// Formatar valor monetário
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formatar data
function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (e) {
    return dateString;
  }
}

// Obter classe de cor para status
function getStatusClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-900 text-green-300';
    case 'inactive':
      return 'bg-yellow-900 text-yellow-300';
    case 'suspended':
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
    case 'suspended':
      return 'Suspenso';
    default:
      return status;
  }
}

// Obter texto para função
function getRoleText(role: string): string {
  switch (role) {
    case 'user':
      return 'Usuário';
    case 'vip':
      return 'VIP';
    default:
      return role;
  }
}

// Suspender usuário
function suspendUser(userId: string) {
  ElMessageBox.confirm(
    'Tem certeza que deseja suspender este usuário?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, suspender',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(async () => {
    const success = await adminUsersStore.updateUser(userId, { status: 'suspended' });
    if (success) {
      ElMessage.success('Usuário suspenso com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Ativar usuário
function activateUser(userId: string) {
  ElMessageBox.confirm(
    'Tem certeza que deseja ativar este usuário?',
    'Confirmação',
    {
      confirmButtonText: 'Sim, ativar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  ).then(async () => {
    const success = await adminUsersStore.updateUser(userId, { status: 'active' });
    if (success) {
      ElMessage.success('Usuário ativado com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Excluir usuário
function deleteUser(userId: string) {
  ElMessageBox.confirm(
    'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.',
    'Confirmação',
    {
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      type: 'error'
    }
  ).then(async () => {
    const success = await adminUsersStore.deleteUser(userId);
    if (success) {
      ElMessage.success('Usuário excluído com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}

// Alterar senha do usuário
function changePassword(userId: string) {
  ElMessageBox.prompt(
    'Digite a nova senha para o usuário (mínimo 6 caracteres)',
    'Alterar senha',
    {
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      inputType: 'password',
      inputValidator: (value) => {
        if (!value) {
          return 'A senha não pode estar vazia';
        }
        if (value.length < 6) {
          return 'A senha deve ter pelo menos 6 caracteres';
        }
        return true;
      }
    }
  ).then(async ({ value: newPassword }) => {
    const success = await adminUsersStore.changeUserPassword(userId, newPassword);
    if (success) {
      ElMessage.success('Senha alterada com sucesso');
    }
  }).catch(() => {
    // Cancelado
  });
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white mb-6">Gerenciamento de Usuários</h1>
    
    <!-- Barra de ações -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
      <div class="flex items-center space-x-4">
        <div class="relative">
          <input 
            v-model="filters.name"
            type="text"
            class="input pr-10"
            placeholder="Buscar por nome..."
            @keyup.enter="applyFilters"
          />
          <button 
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            @click="applyFilters"
          >
            <i class="fas fa-search"></i>
          </button>
        </div>
        
        <button 
          class="btn-outline-secondary flex items-center"
          @click="isFilterPanelOpen = !isFilterPanelOpen"
        >
          <i class="fas fa-filter mr-2"></i>
          Filtros
          <span v-if="adminUsersStore.hasFilters" class="ml-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            <i class="fas fa-check"></i>
          </span>
        </button>
      </div>
      
      <div class="flex items-center space-x-4">
        <select 
          v-model="adminUsersStore.pagination.limit" 
          class="input bg-gray-700 text-white border-gray-600"
          @change="changePageSize(Number(adminUsersStore.pagination.limit))"
        >
          <option v-for="option in pageSizeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Painel de filtros avançados -->
    <div v-if="isFilterPanelOpen" class="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
      <h3 class="text-lg font-medium text-white mb-4">Filtros avançados</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Filtro por email -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input 
            v-model="filters.email"
            type="text"
            class="input w-full"
            placeholder="Filtrar por email"
          />
        </div>
        
        <!-- Filtro por CPF -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">CPF</label>
          <input 
            v-model="filters.cpf"
            type="text"
            class="input w-full"
            placeholder="Filtrar por CPF"
          />
        </div>
        
        <!-- Filtro por telefone -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Telefone</label>
          <input 
            v-model="filters.phone"
            type="text"
            class="input w-full"
            placeholder="Filtrar por telefone"
          />
        </div>
        
        <!-- Filtro por status -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Status</label>
          <select v-model="filters.status" class="input w-full">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Filtro por função -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Função</label>
          <select v-model="filters.role" class="input w-full">
            <option v-for="option in roleOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>
        
        <!-- Filtro por saldo mínimo -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Saldo mínimo</label>
          <input 
            v-model.number="filters.minBalance"
            type="number"
            min="0"
            step="0.01"
            class="input w-full"
            placeholder="R$ 0,00"
          />
        </div>
        
        <!-- Filtro por saldo máximo -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Saldo máximo</label>
          <input 
            v-model.number="filters.maxBalance"
            type="number"
            min="0"
            step="0.01"
            class="input w-full"
            placeholder="R$ 0,00"
          />
        </div>
        
        <!-- Filtro por data de cadastro (início) -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Cadastrado após</label>
          <el-date-picker
            v-model="filters.createdAfter"
            type="date"
            placeholder="Selecione uma data"
            format="DD/MM/YYYY"
            class="w-full"
            value-format="yyyy-MM-dd"
          />
        </div>
        
        <!-- Filtro por data de cadastro (fim) -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Cadastrado antes</label>
          <el-date-picker
            v-model="filters.createdBefore"
            type="date"
            placeholder="Selecione uma data"
            format="DD/MM/YYYY"
            class="w-full"
            value-format="yyyy-MM-dd"
          />
        </div>
        
        <!-- Filtro por último login (início) -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Último login após</label>
          <el-date-picker
            v-model="filters.lastLoginAfter"
            type="date"
            placeholder="Selecione uma data"
            format="DD/MM/YYYY"
            class="w-full"
            value-format="yyyy-MM-dd"
          />
        </div>
        
        <!-- Filtro por último login (fim) -->
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Último login antes</label>
          <el-date-picker
            v-model="filters.lastLoginBefore"
            type="date"
            placeholder="Selecione uma data"
            format="DD/MM/YYYY"
            class="w-full"
            value-format="yyyy-MM-dd"
          />
        </div>
      </div>
      
      <div class="mt-6 flex justify-end space-x-4">
        <button 
          class="btn-outline-secondary"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
        <button 
          class="btn-primary"
          @click="applyFilters"
        >
          Aplicar filtros
        </button>
      </div>
    </div>
    
    <!-- Tabela de usuários -->
    <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div class="p-6 border-b border-gray-700 flex justify-between items-center">
        <h2 class="text-lg font-semibold text-white">Lista de Usuários</h2>
        <span class="text-sm text-gray-400">{{ adminUsersStore.totalUsers }} usuários encontrados</span>
      </div>
      
      <!-- Carregando -->
      <div v-if="adminUsersStore.isLoading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mb-4"></div>
        <p class="text-gray-400">Carregando usuários...</p>
      </div>
      
      <!-- Mensagem de erro -->
      <div v-else-if="adminUsersStore.error" class="p-8 text-center">
        <div class="text-red-500 mb-2">
          <i class="fas fa-exclamation-circle text-2xl"></i>
        </div>
        <p class="text-red-400">{{ adminUsersStore.error }}</p>
        <button 
          class="btn-outline-primary mt-4"
          @click="adminUsersStore.fetchUsers()"
        >
          Tentar novamente
        </button>
      </div>
      
      <!-- Sem usuários -->
      <div v-else-if="!adminUsersStore.hasUsers" class="p-8 text-center">
        <p class="text-gray-400">Nenhum usuário encontrado.</p>
        <button 
          v-if="adminUsersStore.hasFilters"
          class="btn-outline-primary mt-4"
          @click="clearFilters"
        >
          Limpar filtros
        </button>
      </div>
      
      <!-- Tabela -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-700">
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="changeSort('name')"
              >
                Usuário
                <i v-if="currentSort.field === 'name'" 
                   :class="[
                     'ml-1 fas', 
                     currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                   ]"
                ></i>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="changeSort('status')"
              >
                Status
                <i v-if="currentSort.field === 'status'" 
                   :class="[
                     'ml-1 fas', 
                     currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                   ]"
                ></i>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="changeSort('role')"
              >
                Função
                <i v-if="currentSort.field === 'role'" 
                   :class="[
                     'ml-1 fas', 
                     currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                   ]"
                ></i>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="changeSort('balance')"
              >
                Saldo
                <i v-if="currentSort.field === 'balance'" 
                   :class="[
                     'ml-1 fas', 
                     currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                   ]"
                ></i>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="changeSort('lastLogin')"
              >
                Último Login
                <i v-if="currentSort.field === 'lastLogin'" 
                   :class="[
                     'ml-1 fas', 
                     currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                   ]"
                ></i>
              </th>
              <th 
                class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="changeSort('createdAt')"
              >
                Cadastro
                <i v-if="currentSort.field === 'createdAt'" 
                   :class="[
                     'ml-1 fas', 
                     currentSort.order === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
                   ]"
                ></i>
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="user in adminUsersStore.users" :key="user.id" class="hover:bg-gray-700">
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
                {{ formatDate(user.lastLogin) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    v-if="user.status === 'active'"
                    @click="suspendUser(user.id)"
                    class="text-yellow-500 hover:text-yellow-400"
                    title="Suspender usuário"
                  >
                    <i class="fas fa-ban"></i>
                  </button>
                  <button 
                    v-else
                    @click="activateUser(user.id)"
                    class="text-green-500 hover:text-green-400"
                    title="Ativar usuário"
                  >
                    <i class="fas fa-check-circle"></i>
                  </button>
                  <button 
                    @click="changePassword(user.id)"
                    class="text-blue-500 hover:text-blue-400"
                    title="Alterar senha"
                  >
                    <i class="fas fa-key"></i>
                  </button>
                  <button 
                    @click="deleteUser(user.id)"
                    class="text-red-500 hover:text-red-400"
                    title="Excluir usuário"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Paginação -->
      <div v-if="adminUsersStore.totalPages > 1" class="px-6 py-4 bg-gray-800 border-t border-gray-700">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-400">
              Mostrando {{ (adminUsersStore.currentPage - 1) * adminUsersStore.pagination.limit + 1 }} 
              a {{ Math.min(adminUsersStore.currentPage * adminUsersStore.pagination.limit, adminUsersStore.totalUsers) }} 
              de {{ adminUsersStore.totalUsers }} usuários
            </p>
          </div>
          <div class="flex space-x-2">
            <button 
              class="btn-outline-secondary px-3 py-1"
              :disabled="adminUsersStore.currentPage === 1"
              @click="changePage(adminUsersStore.currentPage - 1)"
              :class="{ 'opacity-50 cursor-not-allowed': adminUsersStore.currentPage === 1 }"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <template v-for="page in adminUsersStore.totalPages" :key="page">
              <!-- Mostrar apenas algumas páginas para não sobrecarregar a UI -->
              <button 
                v-if="
                  page === 1 || 
                  page === adminUsersStore.totalPages || 
                  (page >= adminUsersStore.currentPage - 1 && page <= adminUsersStore.currentPage + 1)
                "
                class="btn-outline-secondary px-3 py-1"
                :class="{ 'bg-primary-600 text-white': page === adminUsersStore.currentPage }"
                @click="changePage(page)"
              >
                {{ page }}
              </button>
              
              <!-- Mostrar elipses para páginas omitidas -->
              <span 
                v-else-if="
                  (page === 2 && adminUsersStore.currentPage > 3) || 
                  (page === adminUsersStore.totalPages - 1 && adminUsersStore.currentPage < adminUsersStore.totalPages - 2)
                "
                class="px-2 py-1 text-gray-400"
              >
                ...
              </span>
            </template>
            
            <button 
              class="btn-outline-secondary px-3 py-1"
              :disabled="adminUsersStore.currentPage === adminUsersStore.totalPages"
              @click="changePage(adminUsersStore.currentPage + 1)"
              :class="{ 'opacity-50 cursor-not-allowed': adminUsersStore.currentPage === adminUsersStore.totalPages }"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
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