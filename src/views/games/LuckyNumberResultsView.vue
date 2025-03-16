<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLuckyNumberStore } from '../../stores/lucky-number';
import { useAuthStore } from '../../stores/auth';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const luckyNumberStore = useLuckyNumberStore();
const authStore = useAuthStore();

const isLoading = ref(true);

// Carregar resultados ao montar o componente
onMounted(async () => {
  isLoading.value = true;
  
  try {
    await Promise.all([
      luckyNumberStore.fetchDrawResults(),
      authStore.isAuthenticated ? luckyNumberStore.fetchUserNumbers() : Promise.resolve()
    ]);
  } finally {
    isLoading.value = false;
  }
});

// Resultados ordenados por data (mais recentes primeiro)
const sortedResults = computed(() => {
  return [...luckyNumberStore.drawResults].sort((a, b) => 
    new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
  );
});

// Verificar se o usuário ganhou em um sorteio específico
function userWonDraw(drawId: string) {
  return luckyNumberStore.userNumbers.some(
    number => number.drawId === drawId && number.isWinner === true
  );
}

// Formatar data para exibição
function formatDate(dateString: string) {
  return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">Resultados dos Sorteios</h1>
    
    <div v-if="isLoading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
    </div>
    
    <div v-else-if="sortedResults.length === 0" class="text-center py-12">
      <p class="text-xl text-gray-400">Nenhum resultado de sorteio disponível no momento.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="result in sortedResults" 
        :key="result.id"
        class="card p-6 relative overflow-hidden"
      >
        <!-- Badge para sorteios que o usuário ganhou -->
        <div 
          v-if="authStore.isAuthenticated && userWonDraw(result.drawId)"
          class="absolute top-0 right-0 bg-primary-600 text-white px-3 py-1 rounded-bl-lg font-medium text-sm"
        >
          Você Ganhou!
        </div>
        
        <h3 class="text-xl font-bold mb-4 text-primary-400">
          Sorteio #{{ result.id.substring(0, 8) }}
        </h3>
        
        <div class="mb-4">
          <p class="text-gray-400 mb-1">Data do Sorteio:</p>
          <p class="font-medium">{{ formatDate(result.drawDate) }}</p>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-400 mb-1">Número Sorteado:</p>
          <div class="bg-primary-700 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            {{ result.winningNumber }}
          </div>
        </div>
        
        <div>
          <p class="text-gray-400 mb-1">Status:</p>
          <p v-if="result.winnerId" class="font-medium text-green-500">
            Prêmio Reclamado
          </p>
          <p v-else class="font-medium text-yellow-500">
            Aguardando Ganhador
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'LuckyNumberResultsView'
}
</script> 