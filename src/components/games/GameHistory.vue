<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useScratchCardStore } from '../../stores/scratch-card';
import { useLuckyNumberStore } from '../../stores/lucky-number';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface GameHistoryProps {
  userId: string;
}

const props = defineProps<GameHistoryProps>();

const scratchCardStore = useScratchCardStore();
const luckyNumberStore = useLuckyNumberStore();

const activeTab = ref<'all' | 'scratch-cards' | 'lucky-numbers'>('all');
const isLoading = ref(true);

// Carregar dados ao montar o componente
onMounted(async () => {
  isLoading.value = true;
  
  try {
    await Promise.all([
      scratchCardStore.fetchUserResults(),
      luckyNumberStore.fetchUserNumbers()
    ]);
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  } finally {
    isLoading.value = false;
  }
});

// Formatar data para exibição
function formatDate(dateString: string) {
  return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

// Histórico combinado (raspadinhas e números da sorte)
const combinedHistory = computed(() => {
  const scratchCardHistory = scratchCardStore.userResults.map(result => ({
    id: result.id,
    type: 'scratch-card',
    date: result.createdAt,
    prize: result.prize,
    details: `Raspadinha ${result.scratchCardId.substring(0, 8)}`,
    isWin: result.prize !== null && result.prize > 0
  }));
  
  const luckyNumberHistory = luckyNumberStore.userNumbers.map(number => ({
    id: number.id,
    type: 'lucky-number',
    date: number.purchaseDate,
    prize: null, // Não sabemos o prêmio até que o sorteio aconteça
    details: `Número ${number.number} (Sorteio ${number.drawId.substring(0, 8)})`,
    isWin: number.isWinner === true
  }));
  
  // Combinar e ordenar por data (mais recentes primeiro)
  return [...scratchCardHistory, ...luckyNumberHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

// Histórico filtrado com base na aba ativa
const filteredHistory = computed(() => {
  if (activeTab.value === 'all') {
    return combinedHistory.value;
  } else if (activeTab.value === 'scratch-cards') {
    return combinedHistory.value.filter(item => item.type === 'scratch-card');
  } else {
    return combinedHistory.value.filter(item => item.type === 'lucky-number');
  }
});
</script>

<template>
  <div class="game-history">
    <div class="tabs flex border-b border-gray-700 mb-6">
      <button 
        @click="activeTab = 'all'" 
        class="px-4 py-2 font-medium"
        :class="activeTab === 'all' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-400'"
      >
        Todos
      </button>
      <button 
        @click="activeTab = 'scratch-cards'" 
        class="px-4 py-2 font-medium"
        :class="activeTab === 'scratch-cards' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-400'"
      >
        Raspadinhas
      </button>
      <button 
        @click="activeTab = 'lucky-numbers'" 
        class="px-4 py-2 font-medium"
        :class="activeTab === 'lucky-numbers' ? 'border-b-2 border-primary-500 text-primary-500' : 'text-gray-400'"
      >
        Números da Sorte
      </button>
    </div>
    
    <div v-if="isLoading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <div v-else-if="filteredHistory.length === 0" class="text-center py-8">
      <p class="text-gray-400">Nenhum histórico de jogo encontrado.</p>
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="item in filteredHistory" 
        :key="item.id"
        class="card p-4 flex justify-between items-center"
      >
        <div>
          <div class="flex items-center mb-1">
            <span 
              v-if="item.type === 'scratch-card'" 
              class="bg-secondary-700 text-white text-xs px-2 py-1 rounded mr-2"
            >
              Raspadinha
            </span>
            <span 
              v-else 
              class="bg-primary-700 text-white text-xs px-2 py-1 rounded mr-2"
            >
              Número da Sorte
            </span>
            <span class="text-sm text-gray-400">{{ formatDate(item.date) }}</span>
          </div>
          
          <p class="font-medium">{{ item.details }}</p>
        </div>
        
        <div class="text-right">
          <div 
            v-if="item.isWin" 
            class="text-green-500 font-bold"
          >
            + R$ {{ item.prize?.toFixed(2) || '?' }}
          </div>
          <div 
            v-else-if="item.prize === null && item.type === 'lucky-number'" 
            class="text-yellow-500"
          >
            Aguardando sorteio
          </div>
          <div 
            v-else-if="item.prize === 0 || item.prize === null" 
            class="text-gray-400"
          >
            Sem prêmio
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'GameHistory'
}
</script> 