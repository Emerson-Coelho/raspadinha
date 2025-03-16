import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';

interface LuckyDraw {
  id: string;
  name: string;
  description: string;
  prizeAmount: number;
  prizeDescription: string;
  drawDate: string;
  price: number;
  maxNumbers: number;
  availableNumbers: number[];
  isActive: boolean;
  partnerId?: string;
}

interface UserLuckyNumber {
  id: string;
  drawId: string;
  userId: string;
  number: number;
  purchaseDate: string;
  isWinner: boolean | null;
}

interface DrawResult {
  id: string;
  drawId: string;
  winningNumber: number;
  drawDate: string;
  winnerId: string | null;
}

export const useLuckyNumberStore = defineStore('lucky-number', () => {
  const authStore = useAuthStore();
  
  const availableDraws = ref<LuckyDraw[]>([]);
  const currentDraw = ref<LuckyDraw | null>(null);
  const userNumbers = ref<UserLuckyNumber[]>([]);
  const drawResults = ref<DrawResult[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Estado computado
  const hasActiveDraws = computed(() => 
    availableDraws.value.some(draw => draw.isActive)
  );
  
  const userWinningNumbers = computed(() => 
    userNumbers.value.filter(number => number.isWinner === true)
  );

  // Ações
  async function fetchAvailableDraws() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/lucky-draws');
      availableDraws.value = response.data.draws;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao buscar sorteios';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserNumbers() {
    if (!authStore.isAuthenticated) {
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Configurar o cabeçalho de autorização
      const config = {
        headers: { Authorization: `Bearer ${authStore.token}` }
      };
      
      const response = await axios.get('/lucky-draws/user-numbers', config);
      userNumbers.value = response.data.numbers;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao buscar números';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDrawResults() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/lucky-draws/results');
      drawResults.value = response.data.results;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao buscar resultados';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function buyLuckyNumber(drawId: string, number: number) {
    if (!authStore.isAuthenticated) {
      error.value = 'Você precisa estar logado para comprar um número';
      return null;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Configurar o cabeçalho de autorização
      const config = {
        headers: { Authorization: `Bearer ${authStore.token}` }
      };
      
      const response = await axios.post('/lucky-draws/buy', { drawId, number }, config);
      
      // Encontrar o sorteio
      const selectedDraw = availableDraws.value.find(draw => draw.id === drawId);
      
      // Remover o número da lista de disponíveis
      if (selectedDraw) {
        const drawIndex = availableDraws.value.findIndex(draw => draw.id === drawId);
        if (drawIndex !== -1) {
          availableDraws.value[drawIndex].availableNumbers = 
            availableDraws.value[drawIndex].availableNumbers.filter(n => n !== number);
        }
        
        // Atualizar o saldo do usuário
        if (authStore.user) {
          authStore.user.balance -= selectedDraw.price;
        }
      }
      
      // Adicionar à lista de números do usuário
      userNumbers.value.push(response.data.userNumber);
      
      return response.data.userNumber;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao comprar número';
      } else if (err instanceof Error) {
        error.value = err.message;
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  function setCurrentDraw(drawId: string) {
    currentDraw.value = availableDraws.value.find(draw => draw.id === drawId) || null;
  }

  return {
    availableDraws,
    currentDraw,
    userNumbers,
    drawResults,
    isLoading,
    error,
    hasActiveDraws,
    userWinningNumbers,
    fetchAvailableDraws,
    fetchUserNumbers,
    fetchDrawResults,
    buyLuckyNumber,
    setCurrentDraw
  };
}); 