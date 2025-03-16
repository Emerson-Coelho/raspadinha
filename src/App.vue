<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAuthStore } from './stores/auth';
import { RouterView, useRoute } from 'vue-router';
import AppHeader from './components/common/AppHeader.vue';
import AppFooter from './components/common/AppFooter.vue';
import MobileNavBar from './components/common/MobileNavBar.vue';

const authStore = useAuthStore();
const route = useRoute();

// Verificar se a rota atual é a de administração
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin');
});

onMounted(async () => {
  await authStore.initialize();
});
</script>

<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
    <!-- Layout padrão para todas as páginas exceto admin -->
    <template v-if="!isAdminRoute">
      <AppHeader />
      <main class="flex-grow pt-16">
        <RouterView />
      </main>
      <AppFooter />
      <MobileNavBar />
    </template>
    
    <!-- Layout para páginas de admin -->
    <template v-else>
      <RouterView />
    </template>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
