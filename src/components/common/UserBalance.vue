<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'vue-router';

interface UserBalanceProps {
  showDepositButton?: boolean;
  showWithdrawButton?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const props = withDefaults(defineProps<UserBalanceProps>(), {
  showDepositButton: false,
  showWithdrawButton: false,
  size: 'medium'
});

const authStore = useAuthStore();
const router = useRouter();

const userBalance = computed(() => authStore.user?.balance || 0);

const balanceClass = computed(() => {
  switch (props.size) {
    case 'small':
      return 'text-base';
    case 'large':
      return 'text-2xl';
    default:
      return 'text-lg';
  }
});

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function navigateToDeposit() {
  router.push('/deposit');
}

function navigateToWithdraw() {
  router.push('/withdraw');
}
</script>

<template>
  <div class="user-balance flex items-center gap-3">
    <div>
      <span class="text-gray-400 text-sm mr-1">Saldo:</span>
      <span :class="['font-bold text-primary-500', balanceClass]">
        {{ formatCurrency(userBalance) }}
      </span>
    </div>
    
    <div v-if="showDepositButton || showWithdrawButton" class="flex gap-2">
      <button 
        v-if="showDepositButton" 
        @click="navigateToDeposit"
        class="btn-primary text-sm py-1 px-3"
      >
        Depositar
      </button>
      
      <button 
        v-if="showWithdrawButton" 
        @click="navigateToWithdraw"
        class="btn-outline text-sm py-1 px-3"
      >
        Sacar
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'UserBalance'
}
</script> 