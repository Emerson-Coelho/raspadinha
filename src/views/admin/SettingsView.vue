<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// Abas de configuração
const tabs = [
  { id: 'gateways', name: 'Gateways de Pagamento', route: 'admin-settings-gateways' },
  { id: 'general', name: 'Configurações Gerais', route: 'admin-settings-general' }
];

// Aba atual
const currentTab = ref(route.name);

// Observar mudanças na rota
watch(() => route.name, (newRouteName) => {
  currentTab.value = newRouteName;
});

// Navegar para uma aba
function navigateToTab(routeName: string) {
  router.push({ name: routeName });
}
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-white mb-2">Configurações</h1>
      <p class="text-gray-400">Gerencie as configurações do sistema</p>
    </div>

    <!-- Abas de navegação -->
    <div class="border-b border-gray-700 mb-6">
      <nav class="flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="navigateToTab(tab.route)"
          class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors"
          :class="[
            currentTab === tab.route
              ? 'border-primary-500 text-primary-500'
              : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Conteúdo da aba -->
    <RouterView />
  </div>
</template>

<script lang="ts">
export default {
  name: 'SettingsView'
}
</script> 