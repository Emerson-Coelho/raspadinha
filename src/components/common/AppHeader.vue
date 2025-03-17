<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { ElDropdown, ElDropdownMenu, ElDropdownItem } from 'element-plus';
import UserBalance from './UserBalance.vue';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const isAdmin = computed(() => user.value?.role === 'vip');

function navigateTo(path: string) {
  router.push(path);
}

async function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<template>
  <header class="bg-gray-800 shadow-md fixed top-0 left-0 right-0 z-50">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Logo e navegação principal -->
      <div class="flex items-center space-x-8">
        <router-link to="/" class="flex items-center">
          <span class="text-2xl font-bold text-primary-500">Raspadinha</span>
        </router-link>
        
        <nav class="hidden md:flex space-x-6">
          <router-link to="/" class="text-gray-300 hover:text-white transition-colors">
            Início
          </router-link>
          <router-link to="/games/scratch-card" class="text-gray-300 hover:text-white transition-colors">
            Raspadinhas
          </router-link>
          <router-link to="/games/lucky-number" class="text-gray-300 hover:text-white transition-colors">
            Números da Sorte
          </router-link>
        </nav>
      </div>
      
      <!-- Botões de ação -->
      <div class="flex items-center space-x-4">
        <template v-if="isAuthenticated">
          <div class="hidden md:flex items-center space-x-4">
            <UserBalance :showDepositButton="true" :showWithdrawButton="true" size="small" />
          </div>
          
          <ElDropdown trigger="click">
            <div class="flex items-center cursor-pointer">
              <div class="bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center">
                <span class="text-lg font-medium">{{ user?.name?.charAt(0).toUpperCase() }}</span>
              </div>
              <span class="ml-2 hidden md:inline">{{ user?.name }}</span>
            </div>
            
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem v-if="isAdmin" @click="navigateTo('/admin/dashboard')">
                  Painel Administrativo
                </ElDropdownItem>
                <ElDropdownItem @click="navigateTo('/profile')">
                  Meu Perfil
                </ElDropdownItem>
                <ElDropdownItem @click="navigateTo('/deposit')">
                  Depositar
                </ElDropdownItem>
                <ElDropdownItem @click="navigateTo('/withdraw')">
                  Sacar
                </ElDropdownItem>
                <ElDropdownItem divided @click="handleLogout">
                  Sair
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
        </template>
        
        <template v-else>
          <router-link to="/auth/login" class="btn-outline">
            Entrar
          </router-link>
          <router-link to="/auth/register" class="btn-primary hidden md:inline-block">
            Cadastrar
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
export default {
  name: 'AppHeader'
}
</script> 