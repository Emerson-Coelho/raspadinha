<script setup lang="ts">
import { computed } from 'vue';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LuckyNumber from './LuckyNumber.vue';

interface LuckyDrawDetailsProps {
  draw: {
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
  };
  userNumbers?: number[];
  onBuyNumber?: (number: number) => void;
}

const props = defineProps<LuckyDrawDetailsProps>();

// Formatar data para exibição
function formatDate(dateString: string) {
  return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
}

// Verificar se o sorteio já aconteceu
const isDrawPast = computed(() => {
  return new Date(props.draw.drawDate) < new Date();
});

// Gerar array com todos os números possíveis
const allNumbers = computed(() => {
  return Array.from({ length: props.draw.maxNumbers }, (_, i) => i + 1);
});

// Verificar se um número está disponível
function isNumberAvailable(number: number) {
  return props.draw.availableNumbers.includes(number) && props.draw.isActive && !isDrawPast.value;
}

// Verificar se um número pertence ao usuário
function isNumberOwned(number: number) {
  return props.userNumbers?.includes(number) || false;
}

// Manipular a compra de um número
function handleBuyNumber(number: number) {
  if (props.onBuyNumber) {
    props.onBuyNumber(number);
  }
}
</script>

<template>
  <div class="lucky-draw-details">
    <div class="card mb-6">
      <h2 class="text-2xl font-bold mb-4">{{ draw.name }}</h2>
      
      <p class="text-gray-300 mb-6">{{ draw.description }}</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 class="text-lg font-semibold mb-2 text-primary-400">Prêmio</h3>
          <p class="text-2xl font-bold mb-1">R$ {{ draw.prizeAmount.toFixed(2) }}</p>
          <p class="text-sm text-gray-400">{{ draw.prizeDescription }}</p>
        </div>
        
        <div>
          <h3 class="text-lg font-semibold mb-2 text-primary-400">Data do Sorteio</h3>
          <p class="text-xl font-medium mb-1">{{ formatDate(draw.drawDate) }}</p>
          <p v-if="isDrawPast" class="text-sm text-red-500">Sorteio já realizado</p>
          <p v-else class="text-sm text-green-500">Sorteio em andamento</p>
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div>
          <span class="text-sm text-gray-400">Preço por número:</span>
          <span class="ml-2 font-medium">R$ {{ draw.price.toFixed(2) }}</span>
        </div>
        
        <div>
          <span class="text-sm text-gray-400">Números disponíveis:</span>
          <span class="ml-2 font-medium">{{ draw.availableNumbers.length }} de {{ draw.maxNumbers }}</span>
        </div>
      </div>
    </div>
    
    <h3 class="text-xl font-bold mb-4">Escolha seu número da sorte</h3>
    
    <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      <LuckyNumber
        v-for="number in allNumbers"
        :key="number"
        :number="number"
        :isAvailable="isNumberAvailable(number)"
        :isOwned="isNumberOwned(number)"
        :price="draw.price"
        :onClick="handleBuyNumber"
      />
    </div>
    
    <div class="mt-6 flex flex-wrap gap-2">
      <div class="flex items-center mr-4">
        <div class="w-4 h-4 bg-primary-700 rounded-sm mr-2"></div>
        <span class="text-sm">Seus números</span>
      </div>
      
      <div class="flex items-center mr-4">
        <div class="w-4 h-4 bg-gray-700 rounded-sm mr-2"></div>
        <span class="text-sm">Disponíveis</span>
      </div>
      
      <div class="flex items-center">
        <div class="w-4 h-4 bg-gray-800 opacity-50 rounded-sm mr-2"></div>
        <span class="text-sm">Indisponíveis</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'LuckyDrawDetails'
}
</script> 