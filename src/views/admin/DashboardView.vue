<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Dados simulados para o dashboard
const stats = ref({
  totalUsers: 0,
  activeUsers: 0,
  totalRevenue: 0,
  totalWithdraws: 0,
  conversionRate: 0,
  averageSpend: 0
});

const recentTransactions = ref([
  { id: 1, user: 'João Silva', type: 'deposit', amount: 100, date: '2023-10-15 14:30' },
  { id: 2, user: 'Maria Oliveira', type: 'withdraw', amount: 50, date: '2023-10-15 12:45' },
  { id: 3, user: 'Pedro Santos', type: 'deposit', amount: 200, date: '2023-10-14 18:20' },
  { id: 4, user: 'Ana Costa', type: 'withdraw', amount: 75, date: '2023-10-14 10:15' },
  { id: 5, user: 'Lucas Ferreira', type: 'deposit', amount: 150, date: '2023-10-13 16:50' }
]);

const topGames = ref([
  { id: 1, name: 'Raspadinha Premium', plays: 1250, revenue: 6250 },
  { id: 2, name: 'Raspadinha Especial', plays: 980, revenue: 4900 },
  { id: 3, name: 'Números da Sorte - Semanal', plays: 750, revenue: 3750 },
  { id: 4, name: 'Raspadinha Básica', plays: 650, revenue: 1950 },
  { id: 5, name: 'Números da Sorte - Mensal', plays: 450, revenue: 2250 }
]);

const isLoading = ref(true);

// Simular carregamento de dados
onMounted(() => {
  setTimeout(() => {
    stats.value = {
      totalUsers: 5842,
      activeUsers: 1253,
      totalRevenue: 125750,
      totalWithdraws: 45320,
      conversionRate: 21.5,
      averageSpend: 42.8
    };
    isLoading.value = false;
  }, 1000);
});

// Formatar valor monetário
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Formatar data
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-white mb-6">Dashboard</h1>
    
    <!-- Estatísticas principais -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div v-for="i in 6" :key="i" class="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div class="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div class="h-8 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-gray-400 text-sm font-medium mb-2">Usuários Totais</h3>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-white">{{ stats.totalUsers.toLocaleString() }}</span>
          <span class="ml-2 text-green-500 text-sm">+5.2%</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-gray-400 text-sm font-medium mb-2">Usuários Ativos</h3>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-white">{{ stats.activeUsers.toLocaleString() }}</span>
          <span class="ml-2 text-green-500 text-sm">+3.1%</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-gray-400 text-sm font-medium mb-2">Receita Total</h3>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-white">{{ formatCurrency(stats.totalRevenue) }}</span>
          <span class="ml-2 text-green-500 text-sm">+8.4%</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-gray-400 text-sm font-medium mb-2">Total de Saques</h3>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-white">{{ formatCurrency(stats.totalWithdraws) }}</span>
          <span class="ml-2 text-yellow-500 text-sm">+2.3%</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-gray-400 text-sm font-medium mb-2">Taxa de Conversão</h3>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-white">{{ stats.conversionRate }}%</span>
          <span class="ml-2 text-green-500 text-sm">+1.8%</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h3 class="text-gray-400 text-sm font-medium mb-2">Gasto Médio</h3>
        <div class="flex items-center">
          <span class="text-2xl font-bold text-white">{{ formatCurrency(stats.averageSpend) }}</span>
          <span class="ml-2 text-green-500 text-sm">+4.5%</span>
        </div>
      </div>
    </div>
    
    <!-- Gráficos e tabelas -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Transações recentes -->
      <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-700">
          <h2 class="text-lg font-semibold text-white">Transações Recentes</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-700">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Usuário</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Valor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="transaction in recentTransactions" :key="transaction.id" class="hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ transaction.user }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span 
                    :class="transaction.type === 'deposit' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'" 
                    class="px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {{ transaction.type === 'deposit' ? 'Depósito' : 'Saque' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ formatCurrency(transaction.amount) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{{ transaction.date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-4 border-t border-gray-700 text-center">
          <button class="text-primary-500 hover:text-primary-400 text-sm font-medium">
            Ver todas as transações
          </button>
        </div>
      </div>
      
      <!-- Top jogos -->
      <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-700">
          <h2 class="text-lg font-semibold text-white">Jogos Mais Populares</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gray-700">
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jogo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Jogadas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Receita</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="game in topGames" :key="game.id" class="hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ game.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ game.plays.toLocaleString() }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-white">{{ formatCurrency(game.revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="p-4 border-t border-gray-700 text-center">
          <button class="text-primary-500 hover:text-primary-400 text-sm font-medium">
            Ver relatório completo
          </button>
        </div>
      </div>
    </div>
    
    <!-- Atividade recente -->
    <div class="bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Atividade Recente</h2>
      <div class="space-y-4">
        <div class="flex items-start">
          <div class="flex-shrink-0 bg-blue-500 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-white text-sm">15 novos usuários se registraram nas últimas 24 horas</p>
            <p class="text-gray-400 text-xs mt-1">Hoje, 10:30</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="flex-shrink-0 bg-green-500 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-white text-sm">Receita diária atingiu R$ 5.250,00</p>
            <p class="text-gray-400 text-xs mt-1">Hoje, 09:15</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="flex-shrink-0 bg-yellow-500 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-white text-sm">Nova raspadinha "Prêmio Duplo" foi lançada</p>
            <p class="text-gray-400 text-xs mt-1">Ontem, 16:45</p>
          </div>
        </div>
        
        <div class="flex items-start">
          <div class="flex-shrink-0 bg-purple-500 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-white text-sm">Promoção "Bônus de Primeiro Depósito" ativada</p>
            <p class="text-gray-400 text-xs mt-1">Ontem, 14:20</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DashboardView'
}
</script> 