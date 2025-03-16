<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import DefaultLayout from '../../components/common/DefaultLayout.vue';
import ScratchCard from '../../components/games/ScratchCard.vue';
import { useScratchCardStore } from '../../stores/scratch-card';
import { useAuthStore } from '../../stores/auth';
import { ElMessage, ElDialog } from 'element-plus';

const scratchCardStore = useScratchCardStore();
const authStore = useAuthStore();

const isLoading = ref(true);
const selectedCard = ref<string | null>(null);
const showResultDialog = ref(false);
const lastPrize = ref(0);
const showHistory = ref(false);

// Estado computado
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userBalance = computed(() => authStore.user?.balance || 0);

onMounted(async () => {
  try {
    await scratchCardStore.fetchAvailableScratchCards();
    await scratchCardStore.fetchUserResults();
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    isLoading.value = false;
  }
});

function selectCard(cardId: string) {
  if (!isAuthenticated.value) {
    ElMessage.warning('Você precisa estar logado para jogar.');
    return;
  }
  
  const card = scratchCardStore.availableScratchCards.find(c => c.id === cardId);
  
  if (card && userBalance.value < card.price) {
    ElMessage.warning('Saldo insuficiente. Faça um depósito para continuar jogando.');
    return;
  }
  
  selectedCard.value = cardId;
}

function handleScratchComplete(prize: number) {
  lastPrize.value = prize;
  showResultDialog.value = true;
}

function playAgain() {
  showResultDialog.value = false;
  // Reseta o jogo atual
  scratchCardStore.resetCurrentGame();
  selectedCard.value = null;
}

function toggleHistory() {
  showHistory.value = !showHistory.value;
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-white mb-6">Raspadinhas</h1>
      
      <div v-if="!isAuthenticated" class="card mb-8 p-8 text-center">
        <h2 class="text-2xl font-bold text-white mb-4">Faça login para jogar</h2>
        <p class="text-gray-400 mb-6">
          Você precisa estar logado para comprar e jogar raspadinhas.
        </p>
        <router-link to="/auth/login" class="btn-primary">
          Fazer Login
        </router-link>
      </div>
      
      <div v-else-if="selectedCard" class="max-w-md mx-auto">
        <div class="flex justify-between items-center mb-6">
          <button @click="selectedCard = null" class="btn-outline">
            Voltar
          </button>
          <div class="text-white">
            Saldo: <span class="font-bold text-primary-500">R$ {{ userBalance.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="card p-6">
          <h2 class="text-xl font-bold text-white mb-4 text-center">
            {{ scratchCardStore.currentScratchCard?.name || 'Raspadinha' }}
          </h2>
          
          <ScratchCard 
            :scratch-card-id="selectedCard" 
            @complete="handleScratchComplete"
          />
        </div>
      </div>
      
      <div v-else>
        <!-- Saldo e histórico -->
        <div class="flex justify-between items-center mb-6">
          <div class="text-white">
            Saldo: <span class="font-bold text-primary-500">R$ {{ userBalance.toFixed(2) }}</span>
          </div>
          <button @click="toggleHistory" class="btn-outline">
            {{ showHistory ? 'Ver Raspadinhas' : 'Ver Histórico' }}
          </button>
        </div>
        
        <!-- Lista de raspadinhas disponíveis -->
        <div v-if="!showHistory" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-if="isLoading" class="col-span-full flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
          
          <div 
            v-else
            v-for="card in scratchCardStore.availableScratchCards" 
            :key="card.id"
            class="card hover:shadow-xl transition-shadow cursor-pointer"
            @click="selectCard(card.id)"
          >
            <div class="aspect-video bg-gray-700 rounded-t-lg overflow-hidden">
              <img 
                :src="card.imageUrl" 
                :alt="card.name" 
                class="w-full h-full object-cover"
              />
            </div>
            <div class="p-6">
              <h3 class="text-xl font-bold text-white mb-2">{{ card.name }}</h3>
              <p class="text-gray-400 mb-4">{{ card.description }}</p>
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-primary-500">R$ {{ card.price.toFixed(2) }}</span>
                <button class="btn-primary">
                  Jogar Agora
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Histórico de jogos -->
        <div v-else>
          <h2 class="text-2xl font-bold text-white mb-4">Seu Histórico</h2>
          
          <div v-if="scratchCardStore.userResults.length === 0" class="card p-8 text-center">
            <p class="text-gray-400">
              Você ainda não jogou nenhuma raspadinha.
            </p>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="result in scratchCardStore.userResults" 
              :key="result.id"
              class="card p-4"
            >
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-bold text-white">
                    {{ result.prize && result.prize > 0 ? 'Prêmio: R$ ' + result.prize.toFixed(2) : 'Sem prêmio' }}
                  </h3>
                  <p class="text-sm text-gray-400">
                    {{ new Date(result.createdAt).toLocaleDateString('pt-BR') }}
                  </p>
                </div>
                <div 
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="result.prize && result.prize > 0 ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'"
                >
                  {{ result.prize && result.prize > 0 ? 'Ganhou' : 'Perdeu' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Diálogo de resultado -->
      <ElDialog
        v-model="showResultDialog"
        title="Resultado"
        width="90%"
        max-width="400px"
        center
      >
        <div class="text-center py-4">
          <div v-if="lastPrize > 0">
            <div class="text-6xl text-primary-500 mb-4">🎉</div>
            <h3 class="text-2xl font-bold text-white mb-2">Parabéns!</h3>
            <p class="text-xl text-primary-400 font-bold mb-4">
              Você ganhou R$ {{ lastPrize.toFixed(2) }}
            </p>
          </div>
          <div v-else>
            <div class="text-6xl mb-4">😢</div>
            <h3 class="text-2xl font-bold text-white mb-2">Não foi dessa vez!</h3>
            <p class="text-gray-400 mb-4">
              Continue tentando, a sorte pode estar na próxima raspadinha.
            </p>
          </div>
        </div>
        
        <template #footer>
          <div class="flex justify-center gap-4">
            <button @click="playAgain" class="btn-primary">
              Jogar Novamente
            </button>
            <button @click="showResultDialog = false; selectedCard = null" class="btn-outline">
              Voltar
            </button>
          </div>
        </template>
      </ElDialog>
    </div>
  </DefaultLayout>
</template> 