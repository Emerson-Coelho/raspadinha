<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLuckyNumberStore } from '../../stores/lucky-number';
import { useAuthStore } from '../../stores/auth';
import { ElMessage, ElDialog } from 'element-plus';
import LuckyDrawDetails from '../../components/games/LuckyDrawDetails.vue';
import { useRouter } from 'vue-router';

const luckyNumberStore = useLuckyNumberStore();
const authStore = useAuthStore();
const router = useRouter();

const isLoading = ref(true);
const selectedDraw = ref<string | null>(null);
const selectedNumber = ref<number | null>(null);
const showConfirmDialog = ref(false);
const showSuccessDialog = ref(false);
const showHistory = ref(false);

// Estado computado
const isAuthenticated = computed(() => authStore.isAuthenticated);
const userBalance = computed(() => authStore.user?.balance || 0);
const currentDraw = computed(() => luckyNumberStore.currentDraw);

// Números do usuário para o sorteio atual
const userNumbersForCurrentDraw = computed(() => {
  if (!currentDraw.value) return [];
  
  return luckyNumberStore.userNumbers
    .filter(n => n.drawId === currentDraw.value?.id)
    .map(n => n.number);
});

onMounted(async () => {
  try {
    await Promise.all([
      luckyNumberStore.fetchAvailableDraws(),
      authStore.isAuthenticated ? luckyNumberStore.fetchUserNumbers() : Promise.resolve(),
      luckyNumberStore.fetchDrawResults()
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
  } finally {
    isLoading.value = false;
  }
});

function selectDraw(drawId: string) {
  if (!isAuthenticated.value) {
    ElMessage.warning('Você precisa estar logado para participar dos sorteios.');
    return;
  }
  
  luckyNumberStore.setCurrentDraw(drawId);
  selectedDraw.value = drawId;
  selectedNumber.value = null;
}

function selectNumber(number: number) {
  if (!selectedDraw.value) return;
  
  const draw = luckyNumberStore.availableDraws.find(d => d.id === selectedDraw.value);
  
  if (draw && userBalance.value < draw.price) {
    ElMessage.warning('Saldo insuficiente. Faça um depósito para continuar jogando.');
    return;
  }
  
  selectedNumber.value = number;
  showConfirmDialog.value = true;
}

async function confirmPurchase() {
  if (!selectedDraw.value || selectedNumber.value === null) return;
  
  const result = await luckyNumberStore.buyLuckyNumber(selectedDraw.value, selectedNumber.value);
  
  showConfirmDialog.value = false;
  
  if (result) {
    showSuccessDialog.value = true;
  }
}

function closeSuccessDialog() {
  showSuccessDialog.value = false;
  selectedNumber.value = null;
}

function toggleHistory() {
  showHistory.value = !showHistory.value;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function navigateToResults() {
  router.push({ name: 'lucky-number-results' });
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="!isAuthenticated" class="card mb-8 p-8 text-center">
      <h2 class="text-2xl font-bold mb-4">Faça login para participar</h2>
      <p class="text-gray-400 mb-6">
        Você precisa estar logado para comprar números da sorte.
      </p>
      <router-link to="/auth/login" class="btn-primary">
        Fazer Login
      </router-link>
    </div>
    
    <div v-else-if="selectedDraw && currentDraw" class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-6">
        <button @click="selectedDraw = null" class="btn-outline">
          Voltar
        </button>
        <div>
          Saldo: <span class="font-bold text-primary-500">R$ {{ userBalance.toFixed(2) }}</span>
        </div>
      </div>
      
      <LuckyDrawDetails 
        :draw="currentDraw" 
        :userNumbers="userNumbersForCurrentDraw"
        :onBuyNumber="selectNumber"
      />
    </div>
    
    <div v-else>
      <!-- Cabeçalho com botões de ação -->
      <div class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 class="text-2xl font-bold">Números da Sorte</h2>
        <div class="flex gap-3">
          <button @click="navigateToResults" class="btn-outline">
            Ver Resultados
          </button>
          <button v-if="isAuthenticated" @click="toggleHistory" class="btn-outline">
            {{ showHistory ? 'Ver Sorteios' : 'Meus Números' }}
          </button>
        </div>
      </div>
      
      <!-- Lista de sorteios disponíveis -->
      <div v-if="!showHistory" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-if="isLoading" class="col-span-full flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
        
        <div 
          v-else-if="luckyNumberStore.availableDraws.length === 0"
          class="col-span-full card p-8 text-center"
        >
          <p class="text-gray-400">
            Não há sorteios disponíveis no momento. Volte mais tarde.
          </p>
        </div>
        
        <div 
          v-else
          v-for="draw in luckyNumberStore.availableDraws" 
          :key="draw.id"
          class="card hover:shadow-xl transition-shadow cursor-pointer"
          @click="selectDraw(draw.id)"
        >
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">{{ draw.name }}</h3>
            <p class="text-gray-400 mb-4 line-clamp-2">{{ draw.description }}</p>
            
            <div class="flex justify-between items-center mb-4">
              <div>
                <span class="text-sm text-gray-400">Prêmio</span>
                <p class="text-lg font-bold text-primary-500">R$ {{ draw.prizeAmount.toFixed(2) }}</p>
              </div>
              <div class="text-right">
                <span class="text-sm text-gray-400">Data do Sorteio</span>
                <p class="text-lg font-bold">{{ formatDate(draw.drawDate) }}</p>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-lg font-bold">R$ {{ draw.price.toFixed(2) }} <span class="text-sm font-normal text-gray-400">por número</span></span>
              <button class="btn-primary">
                Participar
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Histórico de números comprados -->
      <div v-else>
        <h2 class="text-2xl font-bold mb-4">Meus Números da Sorte</h2>
        
        <div v-if="luckyNumberStore.userNumbers.length === 0" class="card p-8 text-center">
          <p class="text-gray-400">
            Você ainda não comprou nenhum número da sorte.
          </p>
        </div>
        
        <div v-else class="space-y-4">
          <div 
            v-for="number in luckyNumberStore.userNumbers" 
            :key="number.id"
            class="card p-4"
          >
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <div class="bg-primary-700 text-white text-xl font-bold w-12 h-12 rounded-full flex items-center justify-center mr-4">
                  {{ number.number }}
                </div>
                <div>
                  <p class="font-medium">Sorteio #{{ number.drawId.substring(0, 8) }}</p>
                  <p class="text-sm text-gray-400">Comprado em {{ formatDate(number.purchaseDate) }}</p>
                </div>
              </div>
              <div class="text-right">
                <span 
                  v-if="number.isWinner === true" 
                  class="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  Vencedor
                </span>
                <span 
                  v-else-if="number.isWinner === false" 
                  class="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  Não premiado
                </span>
                <span 
                  v-else 
                  class="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium"
                >
                  Aguardando sorteio
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Diálogo de confirmação -->
    <el-dialog
      v-model="showConfirmDialog"
      title="Confirmar Compra"
      width="90%"
      max-width="400px"
    >
      <div v-if="currentDraw && selectedNumber !== null">
        <p class="mb-4">
          Você está prestes a comprar o número <span class="font-bold">{{ selectedNumber }}</span> 
          do sorteio <span class="font-bold">{{ currentDraw.name }}</span>.
        </p>
        <p class="mb-6">
          Valor: <span class="font-bold text-primary-500">R$ {{ currentDraw.price.toFixed(2) }}</span>
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showConfirmDialog = false" class="btn-outline">
            Cancelar
          </button>
          <button @click="confirmPurchase" class="btn-primary">
            Confirmar Compra
          </button>
        </div>
      </div>
    </el-dialog>
    
    <!-- Diálogo de sucesso -->
    <el-dialog
      v-model="showSuccessDialog"
      title="Compra Realizada"
      width="90%"
      max-width="400px"
    >
      <div class="text-center">
        <div class="text-5xl mb-4">🎉</div>
        <h3 class="text-xl font-bold mb-4">Parabéns!</h3>
        <p class="mb-6">
          Você comprou o número da sorte com sucesso. Boa sorte no sorteio!
        </p>
        <button @click="closeSuccessDialog" class="btn-primary">
          Continuar
        </button>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'LuckyNumberView'
}
</script> 