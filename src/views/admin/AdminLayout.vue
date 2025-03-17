<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAdminStore } from '../../stores/admin';

const router = useRouter();
const route = useRoute();
const adminStore = useAdminStore();

const isSidebarOpen = ref(true);
const isMobileView = ref(false);

// Verificar se o usuário é super admin
const isSuperAdmin = computed(() => adminStore.isSuperAdmin);

// Verificar a rota atual para destacar o item do menu
const currentRoute = computed(() => route.name);

// Itens do menu lateral
const menuItems = [
  { name: 'Dashboard', route: 'admin-dashboard', icon: 'chart-pie' },
  { name: 'Usuários', route: 'admin-users', icon: 'users' },
  { name: 'Parceiros', route: 'admin-partners', icon: 'building' },
  { name: 'Raspadinhas', route: 'admin-scratch-cards', icon: 'ticket' },
  { name: 'Sorteios', route: 'admin-lucky-draws', icon: 'gift' },
  { name: 'Relatórios', route: 'admin-reports', icon: 'chart-bar' },
  { name: 'Configurações', route: 'admin-settings-gateways', icon: 'cog' },
  { 
    name: 'Desenvolvedor', 
    route: 'admin-developer', 
    icon: 'code', 
    superAdminOnly: true 
  }
];

// Verificar o tamanho da tela e ajustar o sidebar
function checkScreenSize() {
  isMobileView.value = window.innerWidth < 768;
  if (isMobileView.value) {
    isSidebarOpen.value = false;
  } else {
    isSidebarOpen.value = true;
  }
}

// Inicializar verificação de tamanho da tela
onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

// Alternar a visibilidade do menu lateral
function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

// Fechar o sidebar após navegação em dispositivos móveis
watch(route, () => {
  if (isMobileView.value) {
    isSidebarOpen.value = false;
  }
});

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
  adminStore.adminLogout();
  router.push('/');
}
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex flex-col md:flex-row">
    <!-- Overlay para dispositivos móveis -->
    <div 
      v-if="isMobileView && isSidebarOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-20"
      @click="toggleSidebar"
    ></div>
    
    <!-- Sidebar -->
    <aside 
      class="bg-gray-800 text-white transition-all duration-300 overflow-hidden z-30"
      :class="[
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        isMobileView ? 'fixed inset-y-0 left-0 w-64' : isSidebarOpen ? 'w-64' : 'w-16'
      ]"
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
              v-if="!item.superAdminOnly || isSuperAdmin"
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
                <svg v-else-if="item.icon === 'cog'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <svg v-else-if="item.icon === 'code'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
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
      <!-- Cabeçalho móvel -->
      <div class="md:hidden bg-gray-800 p-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-primary-500">Admin</h1>
        <button @click="toggleSidebar" class="p-1 rounded-md text-white hover:bg-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
      
      <div class="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  .translate-x-0 {
    transform: translateX(0);
  }
  
  .-translate-x-full {
    transform: translateX(-100%);
  }
}
</style>

<script lang="ts">
export default {
  name: 'AdminLayout'
}
</script> 