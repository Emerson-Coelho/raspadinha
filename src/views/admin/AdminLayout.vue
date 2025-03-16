<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isSidebarOpen = ref(true);

// Verificar se o usuário é administrador
const isAdmin = computed(() => authStore.isAdmin);

// Verificar a rota atual para destacar o item do menu
const currentRoute = computed(() => route.name);

// Itens do menu lateral
const menuItems = [
  { name: 'Dashboard', route: 'admin-dashboard', icon: 'chart-pie' },
  { name: 'Usuários', route: 'admin-users', icon: 'users' },
  { name: 'Parceiros', route: 'admin-partners', icon: 'building' },
  { name: 'Raspadinhas', route: 'admin-scratch-cards', icon: 'ticket' },
  { name: 'Sorteios', route: 'admin-lucky-draws', icon: 'gift' },
  { name: 'Relatórios', route: 'admin-reports', icon: 'chart-bar' }
];

// Alternar a visibilidade do menu lateral
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

// Navegar para uma rota
function navigateTo(routeName: string) {
  router.push({ name: routeName });
}

// Voltar para o site principal
function goToMainSite() {
  router.push('/');
}

// Fazer logout
function handleLogout() {
  authStore.logout();
  router.push('/');
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex">
    <!-- Sidebar -->
    <aside 
      class="bg-gray-800 text-white transition-all duration-300 overflow-hidden"
      :class="isSidebarOpen ? 'w-64' : 'w-16'"
    >
      <div class="p-4 flex items-center justify-between">
        <h1 v-if="isSidebarOpen" class="text-xl font-bold text-primary-500">Admin</h1>
        <button @click="toggleSidebar" class="p-1 rounded-md hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <nav class="mt-6">
        <ul class="space-y-2 px-2">
          <li v-for="item in menuItems" :key="item.route">
            <button
              @click="navigateTo(item.route)"
              class="w-full flex items-center p-2 rounded-md transition-colors"
              :class="currentRoute === item.route ? 'bg-primary-700 text-white' : 'text-gray-300 hover:bg-gray-700'"
            >
              <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                <svg v-if="item.icon === 'chart-pie'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <svg v-else-if="item.icon === 'users'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg v-else-if="item.icon === 'building'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <svg v-else-if="item.icon === 'ticket'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                <svg v-else-if="item.icon === 'gift'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112.83 2.83l-2.83 2.83a2 2 0 01-2.83-2.83L12 6.5V3" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16V8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <svg v-else-if="item.icon === 'chart-bar'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <span v-if="isSidebarOpen" class="ml-3">{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div class="absolute bottom-0 w-full p-4">
        <div class="space-y-2">
          <button
            @click="goToMainSite"
            class="w-full flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7m-7-7v18" />
              </svg>
            </span>
            <span v-if="isSidebarOpen" class="ml-3">Voltar ao Site</span>
          </button>
          
          <button
            @click="handleLogout"
            class="w-full flex items-center p-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <span class="flex-shrink-0 w-6 h-6 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span v-if="isSidebarOpen" class="ml-3">Sair</span>
          </button>
        </div>
      </div>
    </aside>
    
    <!-- Conteúdo principal -->
    <main class="flex-1 overflow-x-hidden overflow-y-auto">
      <div class="container mx-auto px-6 py-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AdminLayout'
}
</script> 