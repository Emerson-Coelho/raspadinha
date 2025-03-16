<script setup lang="ts">
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';

// Props para controlar a exibição do header e footer
defineProps({
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader v-if="showHeader" />
    
    <main class="flex-grow">
      <slot />
    </main>
    
    <AppFooter v-if="showFooter" />
  </div>
</template>

<script lang="ts">
export default {
  name: 'DefaultLayout'
}
</script> 