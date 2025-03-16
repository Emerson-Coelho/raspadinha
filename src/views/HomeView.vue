<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useScratchCardStore } from '../stores/scratch-card';
import { useLuckyNumberStore } from '../stores/lucky-number';
import DefaultLayout from '../components/common/DefaultLayout.vue';
import { ElCarousel, ElCarouselItem } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();
const scratchCardStore = useScratchCardStore();
const luckyNumberStore = useLuckyNumberStore();

const isLoading = ref(true);
const latestWinners = ref<any[]>([]);
const promoSlides = ref([
  {
    id: 1,
    image: 'https://picsum.photos/id/1/1200/462',
    route: '/games/scratch-card'
  },
  {
    id: 2,
    image: 'https://picsum.photos/id/2/1200/462',
    route: '/games/lucky-number'
  },
  {
    id: 3,
    image: 'https://picsum.photos/id/3/1200/462',
    route: '/auth/register'
  }
]);

const youtubeShorts = ref([
  {
    id: 'video1',
    title: 'Ganhador da Raspadinha Premium',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'video2',
    title: 'Como jogar Números da Sorte',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 'video3',
    title: 'Maior prêmio da semana',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
]);

// Dados simulados para ganhadores recentes
const mockWinners = [
  {
    id: 'w1',
    name: 'João Silva',
    prize: 150.0,
    date: '2023-05-15',
    type: 'scratch-card',
    gameTitle: 'Raspadinha'
  },
  {
    id: 'w2',
    name: 'Maria Oliveira',
    prize: 500.0,
    date: '2023-05-10',
    type: 'lucky-number',
    gameTitle: 'Número da Sorte'
  },
  {
    id: 'w3',
    name: 'Pedro Santos',
    prize: 75.0,
    date: '2023-05-08',
    type: 'scratch-card',
    gameTitle: 'Raspadinha'
  }
];

// Detectar se é dispositivo móvel
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  return false;
});

// Atualizar isMobile quando a janela for redimensionada
onMounted(() => {
  window.addEventListener('resize', () => {
    // O valor computado será recalculado automaticamente
  });
});

onMounted(async () => {
  try {
    // Carregar dados disponíveis
    await Promise.all([
      scratchCardStore.fetchAvailableScratchCards(),
      luckyNumberStore.fetchDrawResults()
    ]);
    
    // Usar dados simulados para demonstração
    latestWinners.value = mockWinners;
  } catch (error) {
    console.error('Erro ao carregar dados da página inicial:', error);
  } finally {
    isLoading.value = false;
  }
});

function navigateTo(route: string) {
  router.push(route);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para lidar com a mudança de slide no carrossel
function handleCarouselChange(index: number) {
  console.log('Slide atual:', index);
}

// Referência para o carrossel com tipo correto
const carouselRef = ref<any>(null);

// Variáveis para controle de toque/arrasto
const touchStartX = ref(0);
const touchEndX = ref(0);

// Funções para detectar arrasto
function handleTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0].clientX;
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX.value = event.changedTouches[0].clientX;
  handleSwipe();
}

function handleMouseDown(event: MouseEvent) {
  // Verificar se o clique foi feito com o botão esquerdo do mouse
  if (event.button === 0) {
    touchStartX.value = event.clientX;
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
  }
}

function handleMouseUp(event: MouseEvent) {
  touchEndX.value = event.clientX;
  handleSwipe();
  document.removeEventListener('mouseup', handleMouseUp);
  document.removeEventListener('mousemove', handleMouseMove);
}

function handleMouseMove(event: MouseEvent) {
  // Prevenir comportamento padrão durante o arrasto
  event.preventDefault();
}

function handleSwipe() {
  const swipeThreshold = 50; // Mínimo de pixels para considerar um swipe
  const diff = touchEndX.value - touchStartX.value;
  
  if (diff > swipeThreshold && carouselRef.value) {
    // Swipe para a direita - slide anterior
    carouselRef.value.prev();
  } else if (diff < -swipeThreshold && carouselRef.value) {
    // Swipe para a esquerda - próximo slide
    carouselRef.value.next();
  }
}
</script>

<template>
  <DefaultLayout :showHeader="false" :showFooter="false">
    <div class="max-w-7xl mx-auto px-4 md:px-6">
      <!-- Banner Principal -->
      <section class="mb-12 -mx-4 md:mx-0 flex justify-center md:pt-6">
            <ElCarousel 
              ref="carouselRef"
              :interval="5000" 
              type=""
              height="auto"
              :autoplay="true"
              indicator-position="outside"
              arrow="always"
              @change="handleCarouselChange"
              class="banner-carousel"
            >
              <ElCarouselItem 
                v-for="slide in promoSlides" 
                :key="slide.id"
                @touchstart="handleTouchStart"
                @touchend="handleTouchEnd"
                @mousedown="handleMouseDown"
                class="banner-item"
              >
                <div 
                  class="h-full w-full rounded-lg overflow-hidden relative cursor-pointer banner-content"
                  :style="{ backgroundImage: `url(${slide.image})` }"
                  @click="navigateTo(slide.route)"
                >
                </div>
              </ElCarouselItem>
            </ElCarousel>
      </section>
      
      <!-- Conteúdo restante com padding normal -->
      <div class="px-4">
        <!-- Seção Promocional Ativa -->
        <section class="mb-12 card p-4 md:p-8">
          <div class="flex flex-col md:flex-row items-center">
            <div class="md:w-1/2 mb-6 md:mb-0 md:pr-8">
              <h2 class="text-2xl font-bold text-white mb-4">Promoção Especial</h2>
              <p class="text-gray-300 mb-6">
                Aproveite nossa promoção especial! Faça um depósito hoje e ganhe 50% de bônus para jogar em nossas raspadinhas e números da sorte.
              </p>
              <div class="flex space-x-4">
                <button @click="navigateTo('/auth/register')" class="btn-primary">
                  Cadastre-se
                </button>
                <button @click="navigateTo('/games/scratch-card')" class="btn-outline">
                  Ver Jogos
                </button>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gray-800 p-6 rounded-lg border border-primary-500">
                <h3 class="text-xl font-bold text-white mb-4">Bônus de 50%</h3>
                <ul class="space-y-3 text-gray-300">
                  <li class="flex items-start">
                    <span class="text-primary-500 mr-2">✓</span>
                    <span>Válido para novos usuários</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-primary-500 mr-2">✓</span>
                    <span>Depósito mínimo de R$ 20,00</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-primary-500 mr-2">✓</span>
                    <span>Bônus creditado instantaneamente</span>
                  </li>
                  <li class="flex items-start">
                    <span class="text-primary-500 mr-2">✓</span>
                    <span>Válido por 7 dias após o cadastro</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        
        <!-- Últimos Resultados e Ganhadores -->
        <section class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">Últimos Ganhadores</h2>
          
          <div v-if="isLoading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
          
          <div v-else-if="latestWinners.length === 0" class="card p-4 md:p-8 text-center">
            <p class="text-gray-400">
              Ainda não temos ganhadores para exibir. Seja o primeiro!
            </p>
          </div>
          
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div 
              v-for="winner in latestWinners" 
              :key="winner.id"
              class="card p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-700 flex items-center justify-center text-white text-lg md:text-xl font-bold">
                  {{ winner.name.charAt(0) }}
                </div>
                <div class="ml-3 md:ml-4">
                  <h3 class="font-bold text-white text-sm md:text-base">{{ winner.name }}</h3>
                  <p class="text-xs md:text-sm text-gray-400">{{ winner.gameTitle }}</p>
                </div>
              </div>
              <div class="mb-2">
                <span class="text-xs md:text-sm text-gray-400">Prêmio</span>
                <p class="text-lg md:text-xl font-bold text-primary-500">{{ formatCurrency(winner.prize) }}</p>
              </div>
              <p class="text-xs md:text-sm text-gray-400">
                Ganhou em: {{ formatDate(winner.date) }}
              </p>
            </div>
          </div>
        </section>
        
        <!-- Vídeos Integrados -->
        <section class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">Veja Quem Está Ganhando</h2>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div 
              v-for="video in youtubeShorts" 
              :key="video.id"
              class="card overflow-hidden"
            >
              <div class="aspect-video">
                <iframe 
                  class="w-full h-full"
                  :src="video.embedUrl" 
                  title="YouTube video player" 
                  frameborder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen
                ></iframe>
              </div>
              <div class="p-3 md:p-4">
                <h3 class="font-bold text-white text-sm md:text-base">{{ video.title }}</h3>
              </div>
            </div>
          </div>
        </section>
        
        <!-- CTA Final -->
        <section class="card p-4 md:p-8 text-center mb-12">
          <h2 class="text-2xl md:text-3xl font-bold text-white mb-4">Pronto para Ganhar?</h2>
          <p class="text-gray-300 mb-6 max-w-2xl mx-auto text-sm md:text-base">
            Junte-se a milhares de jogadores que já estão se divertindo e ganhando prêmios em nossa plataforma.
          </p>
          <div class="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button 
              v-if="!authStore.isAuthenticated" 
              @click="navigateTo('/auth/register')" 
              class="btn-primary"
            >
              Criar Conta
            </button>
            <button @click="navigateTo('/games/scratch-card')" class="btn-primary">
              Jogar Agora
            </button>
          </div>
        </section>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
export default {
  name: 'HomeView'
}
</script>

<style scoped>
/* Estilos específicos para o carrossel na página inicial */
:deep(.el-carousel__item) {
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
  -webkit-user-drag: none;
}

:deep(.el-carousel__item:active) {
  cursor: pointer;
}

:deep(.el-carousel__item > div) {
  transition: transform 0.3s ease;
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  height: 100%;
  width: 100%;
}

:deep(.el-carousel__item > div:hover) {
  transform: scale(1.02);
}

@media (max-width: 768px) {
  :deep(.el-carousel__arrow) {
    width: 30px;
    height: 30px;
    font-size: 12px;
  }
  
  :deep(.el-carousel__container) {
    aspect-ratio: 13/5;
  }
  
  :deep(.el-carousel__item > div) {
    background-size: contain !important;
  }
}

/* Proporção de aspecto 13:5 para os banners */
.banner-carousel {
  width: 100%;
  margin-top: -1px; /* Para compensar qualquer gap residual */
}

.banner-item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  background-size: contain !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
}

:deep(.el-carousel__container) {
  aspect-ratio: 13/5;
  height: auto !important;
  background-color: #0a0e17;
}

:deep(.el-carousel__item) {
  height: 100% !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-carousel__indicators) {
  margin: 0;
  padding: 0;
}

:deep(.el-carousel__indicators--outside) {
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .banner-carousel {
    margin: 0;
    padding: 0;
  }
  
  :deep(.el-carousel__container) {
    margin: 0;
    padding: 0;
  }
  
  :deep(.el-carousel__indicators--outside) {
    margin-top: 4px;
    transform: translateY(-4px);
  }
}
</style> 