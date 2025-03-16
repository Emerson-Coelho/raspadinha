<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElMessage, ElTabs, ElTabPane } from 'element-plus';
import DefaultLayout from '../../components/common/DefaultLayout.vue';

const router = useRouter();
const authStore = useAuthStore();
const activeTab = ref('dashboard');
const isLoading = ref(true);

// Definir interface para transações
interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  gameId?: string;
}

// Dados para o dashboard
const dashboardData = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalRevenue: 0,
  totalGames: 0,
  recentTransactions: [] as Transaction[]
});

// Dados simulados para demonstração
const mockData = {
  users: [
    { id: 'u1', name: 'João Silva', email: 'joao@example.com', cpf: '123.456.789-00', phone: '(11) 98765-4321', balance: 150, createdAt: '2023-05-01' },
    { id: 'u2', name: 'Maria Oliveira', email: 'maria@example.com', cpf: '987.654.321-00', phone: '(21) 98765-4321', balance: 75, createdAt: '2023-05-05' },
    { id: 'u3', name: 'Pedro Santos', email: 'pedro@example.com', cpf: '456.789.123-00', phone: '(31) 98765-4321', balance: 200, createdAt: '2023-05-10' }
  ],
  scratchCards: [
    { id: 'sc1', name: 'Raspadinha Premium', price: 20, type: 'premium', isActive: true, totalSold: 150 },
    { id: 'sc2', name: 'Raspadinha Regular', price: 10, type: 'regular', isActive: true, totalSold: 300 },
    { id: 'sc3', name: 'Raspadinha Especial', price: 30, type: 'special', isActive: false, totalSold: 50 }
  ],
  luckyDraws: [
    { id: 'ld1', name: 'Sorteio Semanal', price: 5, drawDate: '2023-06-01', prizeAmount: 1000, totalSold: 250 },
    { id: 'ld2', name: 'Sorteio Mensal', price: 10, drawDate: '2023-06-15', prizeAmount: 5000, totalSold: 150 }
  ],
  transactions: [
    { id: 't1', userId: 'u1', type: 'deposit', amount: 100, date: '2023-05-20', status: 'completed' },
    { id: 't2', userId: 'u2', type: 'withdraw', amount: 50, date: '2023-05-19', status: 'completed' },
    { id: 't3', userId: 'u3', type: 'game', amount: -20, date: '2023-05-18', status: 'completed', gameId: 'sc1' },
    { id: 't4', userId: 'u1', type: 'game', amount: 75, date: '2023-05-17', status: 'completed', gameId: 'sc1' }
  ] as Transaction[]
};

onMounted(() => {
  // Verificar se o usuário é administrador
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    ElMessage.error('Você não tem permissão para acessar esta página');
    router.push('/');
    return;
  }
  
  // Carregar dados do dashboard
  loadDashboardData();
});

function loadDashboardData() {
  isLoading.value = true;
  
  // Simulação de carregamento de dados
  setTimeout(() => {
    // Calcular estatísticas
    const totalUsers = mockData.users.length;
    const activeUsers = totalUsers; // Todos os usuários são considerados ativos neste exemplo
    
    const totalRevenue = mockData.transactions
      .filter(t => t.type === 'deposit' || (t.type === 'game' && t.amount > 0))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalGames = mockData.transactions
      .filter(t => t.type === 'game')
      .length;
    
    // Ordenar transações por data (mais recentes primeiro)
    const recentTransactions = [...mockData.transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(t => {
        const user = mockData.users.find(u => u.id === t.userId);
        return {
          ...t,
          userName: user ? user.name : 'Usuário Desconhecido'
        };
      });
    
    // Atualizar dados do dashboard
    dashboardData.value = {
      totalUsers,
      activeUsers,
      totalRevenue,
      totalGames,
      recentTransactions
    };
    
    isLoading.value = false;
  }, 1000);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function getTransactionIcon(type: string) {
  switch (type) {
    case 'deposit':
      return '💰';
    case 'withdraw':
      return '💸';
    case 'game':
      return '🎮';
    default:
      return '💵';
  }
}

function getTransactionClass(type: string, amount: number) {
  if (type === 'deposit' || amount > 0) {
    return 'text-green-500';
  } else if (type === 'withdraw' || amount < 0) {
    return 'text-red-500';
  }
  return '';
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-white">Painel Administrativo</h1>
      </div>
      
      <ElTabs v-model="activeTab" class="admin-tabs">
        <!-- Dashboard -->
        <ElTabPane label="Dashboard" name="dashboard">
          <div v-if="isLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
          
          <div v-else>
            <!-- Estatísticas -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div class="card p-6">
                <h3 class="text-lg font-semibold text-gray-400 mb-2">Total de Usuários</h3>
                <p class="text-3xl font-bold text-white">{{ dashboardData.totalUsers }}</p>
              </div>
              
              <div class="card p-6">
                <h3 class="text-lg font-semibold text-gray-400 mb-2">Usuários Ativos</h3>
                <p class="text-3xl font-bold text-white">{{ dashboardData.activeUsers }}</p>
              </div>
              
              <div class="card p-6">
                <h3 class="text-lg font-semibold text-gray-400 mb-2">Receita Total</h3>
                <p class="text-3xl font-bold text-primary-500">{{ formatCurrency(dashboardData.totalRevenue) }}</p>
              </div>
              
              <div class="card p-6">
                <h3 class="text-lg font-semibold text-gray-400 mb-2">Total de Jogos</h3>
                <p class="text-3xl font-bold text-white">{{ dashboardData.totalGames }}</p>
              </div>
            </div>
            
            <!-- Transações Recentes -->
            <div class="card p-6 mb-8">
              <h2 class="text-xl font-bold text-white mb-6">Transações Recentes</h2>
              
              <div v-if="dashboardData.recentTransactions.length === 0" class="text-center py-8">
                <p class="text-gray-400">Não há transações recentes para exibir.</p>
              </div>
              
              <div v-else class="space-y-4">
                <div 
                  v-for="transaction in dashboardData.recentTransactions" 
                  :key="transaction.id"
                  class="bg-gray-800 p-4 rounded-lg flex items-center"
                >
                  <div class="text-2xl mr-4">
                    {{ getTransactionIcon(transaction.type) }}
                  </div>
                  
                  <div class="flex-grow">
                    <div class="flex justify-between items-center mb-1">
                      <h3 class="font-medium text-white">
                        {{ transaction.userName }}
                      </h3>
                      <span 
                        class="font-bold"
                        :class="getTransactionClass(transaction.type, transaction.amount)"
                      >
                        {{ formatCurrency(transaction.amount) }}
                      </span>
                    </div>
                    
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-400">
                        {{ formatDate(transaction.date) }}
                      </span>
                      <span class="text-gray-400">
                        {{ transaction.type === 'deposit' ? 'Depósito' : 
                           transaction.type === 'withdraw' ? 'Saque' : 'Jogo' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Gráficos (Simulados) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="card p-6">
                <h2 class="text-xl font-bold text-white mb-4">Receita Mensal</h2>
                <div class="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p class="text-gray-400">Gráfico de Receita Mensal</p>
                </div>
              </div>
              
              <div class="card p-6">
                <h2 class="text-xl font-bold text-white mb-4">Jogos por Tipo</h2>
                <div class="bg-gray-800 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p class="text-gray-400">Gráfico de Jogos por Tipo</p>
                </div>
              </div>
            </div>
          </div>
        </ElTabPane>
        
        <!-- Usuários -->
        <ElTabPane label="Usuários" name="users">
          <div class="card p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-white">Gerenciar Usuários</h2>
              <button class="btn-primary py-2 px-4">
                Adicionar Usuário
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left border-b border-gray-700">
                    <th class="pb-3 text-gray-400 font-medium">Nome</th>
                    <th class="pb-3 text-gray-400 font-medium">Email</th>
                    <th class="pb-3 text-gray-400 font-medium">CPF</th>
                    <th class="pb-3 text-gray-400 font-medium">Telefone</th>
                    <th class="pb-3 text-gray-400 font-medium">Saldo</th>
                    <th class="pb-3 text-gray-400 font-medium">Data de Cadastro</th>
                    <th class="pb-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="user in mockData.users" 
                    :key="user.id"
                    class="border-b border-gray-800"
                  >
                    <td class="py-4 text-white">{{ user.name }}</td>
                    <td class="py-4 text-white">{{ user.email }}</td>
                    <td class="py-4 text-white">{{ user.cpf }}</td>
                    <td class="py-4 text-white">{{ user.phone }}</td>
                    <td class="py-4 text-primary-500 font-medium">{{ formatCurrency(user.balance) }}</td>
                    <td class="py-4 text-white">{{ formatDate(user.createdAt) }}</td>
                    <td class="py-4">
                      <div class="flex space-x-2">
                        <button class="text-blue-500 hover:text-blue-400">
                          Editar
                        </button>
                        <button class="text-red-500 hover:text-red-400">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ElTabPane>
        
        <!-- Raspadinhas -->
        <ElTabPane label="Raspadinhas" name="scratch-cards">
          <div class="card p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-white">Gerenciar Raspadinhas</h2>
              <button class="btn-primary py-2 px-4">
                Nova Raspadinha
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left border-b border-gray-700">
                    <th class="pb-3 text-gray-400 font-medium">Nome</th>
                    <th class="pb-3 text-gray-400 font-medium">Preço</th>
                    <th class="pb-3 text-gray-400 font-medium">Tipo</th>
                    <th class="pb-3 text-gray-400 font-medium">Status</th>
                    <th class="pb-3 text-gray-400 font-medium">Total Vendido</th>
                    <th class="pb-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="card in mockData.scratchCards" 
                    :key="card.id"
                    class="border-b border-gray-800"
                  >
                    <td class="py-4 text-white">{{ card.name }}</td>
                    <td class="py-4 text-white">{{ formatCurrency(card.price) }}</td>
                    <td class="py-4 text-white capitalize">{{ card.type }}</td>
                    <td class="py-4">
                      <span 
                        class="px-2 py-1 rounded-full text-xs font-medium"
                        :class="card.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'"
                      >
                        {{ card.isActive ? 'Ativo' : 'Inativo' }}
                      </span>
                    </td>
                    <td class="py-4 text-white">{{ card.totalSold }}</td>
                    <td class="py-4">
                      <div class="flex space-x-2">
                        <button class="text-blue-500 hover:text-blue-400">
                          Editar
                        </button>
                        <button 
                          class="hover:text-opacity-80"
                          :class="card.isActive ? 'text-yellow-500' : 'text-green-500'"
                        >
                          {{ card.isActive ? 'Desativar' : 'Ativar' }}
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ElTabPane>
        
        <!-- Números da Sorte -->
        <ElTabPane label="Números da Sorte" name="lucky-numbers">
          <div class="card p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold text-white">Gerenciar Sorteios</h2>
              <button class="btn-primary py-2 px-4">
                Novo Sorteio
              </button>
            </div>
            
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="text-left border-b border-gray-700">
                    <th class="pb-3 text-gray-400 font-medium">Nome</th>
                    <th class="pb-3 text-gray-400 font-medium">Preço</th>
                    <th class="pb-3 text-gray-400 font-medium">Data do Sorteio</th>
                    <th class="pb-3 text-gray-400 font-medium">Prêmio</th>
                    <th class="pb-3 text-gray-400 font-medium">Total Vendido</th>
                    <th class="pb-3 text-gray-400 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="draw in mockData.luckyDraws" 
                    :key="draw.id"
                    class="border-b border-gray-800"
                  >
                    <td class="py-4 text-white">{{ draw.name }}</td>
                    <td class="py-4 text-white">{{ formatCurrency(draw.price) }}</td>
                    <td class="py-4 text-white">{{ formatDate(draw.drawDate) }}</td>
                    <td class="py-4 text-primary-500 font-medium">{{ formatCurrency(draw.prizeAmount) }}</td>
                    <td class="py-4 text-white">{{ draw.totalSold }}</td>
                    <td class="py-4">
                      <div class="flex space-x-2">
                        <button class="text-blue-500 hover:text-blue-400">
                          Editar
                        </button>
                        <button class="text-green-500 hover:text-green-400">
                          Realizar Sorteio
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </ElTabPane>
        
        <!-- Configurações -->
        <ElTabPane label="Configurações" name="settings">
          <div class="card p-6">
            <h2 class="text-xl font-bold text-white mb-6">Configurações do Sistema</h2>
            
            <div class="space-y-8">
              <!-- Configurações Gerais -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-4">Configurações Gerais</h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Nome da Plataforma
                    </label>
                    <input
                      type="text"
                      value="Raspadinha Online"
                      class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Email de Contato
                    </label>
                    <input
                      type="email"
                      value="contato@raspadinha.com"
                      class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <!-- Configurações de Pagamento -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-4">Configurações de Pagamento</h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Valor Mínimo de Depósito
                    </label>
                    <input
                      type="number"
                      value="20"
                      class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      Valor Mínimo de Saque
                    </label>
                    <input
                      type="number"
                      value="50"
                      class="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div class="flex items-center">
                    <input
                      id="pix-enabled"
                      type="checkbox"
                      checked
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-700 rounded bg-gray-800"
                    />
                    <label for="pix-enabled" class="ml-2 block text-sm text-gray-300">
                      Habilitar pagamentos via PIX
                    </label>
                  </div>
                </div>
              </div>
              
              <!-- Configurações de Jogos -->
              <div>
                <h3 class="text-lg font-semibold text-white mb-4">Configurações de Jogos</h3>
                
                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">
                      RTP (Return to Player) Padrão
                    </label>
                    <div class="flex items-center">
                      <input
                        type="number"
                        value="85"
                        class="w-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span class="ml-2 text-gray-400">%</span>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">
                      Porcentagem do valor apostado que retorna aos jogadores em forma de prêmios.
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="flex justify-end">
                <button class="btn-primary py-2 px-6">
                  Salvar Configurações
                </button>
              </div>
            </div>
          </div>
        </ElTabPane>
      </ElTabs>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
export default {
  name: 'AdminView'
}
</script>

<style scoped>
.admin-tabs :deep(.el-tabs__item) {
  color: #a0aec0;
}

.admin-tabs :deep(.el-tabs__item.is-active) {
  color: #fff;
}

.admin-tabs :deep(.el-tabs__active-bar) {
  background-color: var(--el-color-primary);
}
</style> 