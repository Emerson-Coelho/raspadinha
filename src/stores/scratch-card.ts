import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';

interface ScratchCard {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  type: 'premium' | 'regular' | 'special';
  prizes: Prize[];
  isActive: boolean;
  partnerId?: string;
}

interface Prize {
  id: string;
  value: number;
  probability: number;
  description: string;
}

interface ScratchCardResult {
  id: string;
  scratchCardId: string;
  userId: string;
  prize: number | null;
  createdAt: string;
  isRevealed: boolean;
}

export const useScratchCardStore = defineStore('scratch-card', () => {
  const authStore = useAuthStore();
  
  const availableScratchCards = ref<ScratchCard[]>([]);
  const currentScratchCard = ref<ScratchCard | null>(null);
  const scratchCardResult = ref<ScratchCardResult | null>(null);
  const userResults = ref<ScratchCardResult[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Estado computado
  const hasPremiumCards = computed(() => 
    availableScratchCards.value.some(card => card.type === 'premium')
  );
  
  const hasSpecialCards = computed(() => 
    availableScratchCards.value.some(card => card.type === 'special')
  );

  // Ações
  async function fetchAvailableScratchCards() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get('/scratch-cards');
      availableScratchCards.value = response.data.scratchCards;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao buscar raspadinhas';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function buyScratchCard(scratchCardId: string) {
    if (!authStore.isAuthenticated) {
      error.value = 'Você precisa estar logado para comprar uma raspadinha';
      return null;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Configurar o cabeçalho de autorização
      const config = {
        headers: { Authorization: `Bearer ${authStore.token}` }
      };
      
      const response = await axios.post('/scratch-cards/buy', { scratchCardId }, config);
      
      // Encontrar a raspadinha comprada
      const selectedCard = availableScratchCards.value.find(card => card.id === scratchCardId);
      
      if (selectedCard) {
        currentScratchCard.value = selectedCard;
      }
      
      scratchCardResult.value = response.data.result;
      
      // Atualizar o saldo do usuário (simulação)
      if (authStore.user && selectedCard) {
        authStore.user.balance -= selectedCard.price;
      }
      
      return response.data.result;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao comprar raspadinha';
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

  async function revealScratchCard(resultId: string) {
    if (!scratchCardResult.value || scratchCardResult.value.id !== resultId) {
      error.value = 'Resultado não encontrado';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Configurar o cabeçalho de autorização
      const config = {
        headers: { Authorization: `Bearer ${authStore.token}` }
      };
      
      const response = await axios.post('/scratch-cards/reveal', { resultId }, config);
      
      scratchCardResult.value.isRevealed = true;
      
      // Atualizar o saldo do usuário se ganhou prêmio
      if (authStore.user && scratchCardResult.value.prize && scratchCardResult.value.prize > 0) {
        authStore.user.balance += scratchCardResult.value.prize;
      }
      
      // Adicionar ao histórico do usuário
      userResults.value.unshift(response.data.result);
      
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        error.value = err.response.data.message || 'Erro ao revelar raspadinha';
      } else {
        error.value = 'Erro ao conectar com o servidor';
      }
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserResults() {
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
      
      const response = await axios.get('/scratch-cards/results', config);
      userResults.value = response.data.results;
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

  function resetCurrentGame() {
    currentScratchCard.value = null;
    scratchCardResult.value = null;
  }

  return {
    availableScratchCards,
    currentScratchCard,
    scratchCardResult,
    userResults,
    isLoading,
    error,
    hasPremiumCards,
    hasSpecialCards,
    fetchAvailableScratchCards,
    buyScratchCard,
    revealScratchCard,
    fetchUserResults,
    resetCurrentGame
  };
}); 