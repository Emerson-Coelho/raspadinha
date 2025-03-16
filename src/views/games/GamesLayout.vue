<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DefaultLayout from '../../components/common/DefaultLayout.vue';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const userBalance = computed(() => authStore.user?.balance || 0);

const tabs = [
  { name: 'Raspadinhas', route: '/games/scratch-card' },
  { name: 'Números da Sorte', route: '/games/lucky-number' }
];

const activeTab = computed(() => {
  return route.path;
});

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="container mx-auto px-4">
      
      <!-- Conteúdo da página -->
      <router-view />
    </div>
  </DefaultLayout>
</template> 