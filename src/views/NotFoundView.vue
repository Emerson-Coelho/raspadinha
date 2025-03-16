<script setup lang="ts">
import { useRouter } from 'vue-router';
import DefaultLayout from '../components/common/DefaultLayout.vue';

const router = useRouter();

function goHome() {
  router.push('/');
}

function goBack() {
  router.back();
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 pt-16 md:pt-0">
      <div class="text-9xl font-bold text-primary-500 mb-6">404</div>
      
      <h1 class="text-4xl font-bold text-white mb-4">Página não encontrada</h1>
      
      <p class="text-gray-400 max-w-md mb-8">
        Desculpe, a página que você está procurando não existe ou foi movida.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="goHome" class="btn-primary">
          Voltar para o Início
        </button>
        <button @click="goBack" class="btn-outline">
          Voltar para a página anterior
        </button>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
export default {
  name: 'NotFoundView'
}
</script> 