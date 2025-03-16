<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { computed } from 'vue';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
    <div class="flex justify-around items-center py-2">
      <!-- Raspadinhas -->
      <button 
        @click="navigateTo('/games/scratch-card')" 
        class="flex flex-col items-center p-2 text-gray-300 hover:text-primary-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
        <span class="text-xs mt-1">Raspadinhas</span>
      </button>
      
      <!-- Números da Sorte -->
      <button 
        @click="navigateTo('/games/lucky-number')" 
        class="flex flex-col items-center p-2 text-gray-300 hover:text-primary-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
        <span class="text-xs mt-1">Números</span>
      </button>
      
      <!-- Financeiro (Depósito/Saque) -->
      <button 
        @click="navigateTo(isAuthenticated ? '/deposit' : '/auth/login')" 
        class="flex flex-col items-center p-2 text-gray-300 hover:text-primary-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs mt-1">Financeiro</span>
      </button>
      
      <!-- Perfil -->
      <button 
        @click="navigateTo(isAuthenticated ? '/profile' : '/auth/login')" 
        class="flex flex-col items-center p-2 text-gray-300 hover:text-primary-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs mt-1">Perfil</span>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'MobileNavBar'
}
</script> 