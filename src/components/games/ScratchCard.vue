<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useScratchCardStore } from '../../stores/scratch-card';
import confetti from 'canvas-confetti';

interface ScratchCardProps {
  scratchCardId: string;
}

const props = defineProps<ScratchCardProps>();
const emit = defineEmits<{
  (e: 'complete', prize: number): void;
}>();

const scratchCardStore = useScratchCardStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isRevealing = ref(false);
const isRevealed = ref(false);
const revealPercentage = ref(0);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);

// Configurações da raspadinha
const REVEAL_THRESHOLD = 50; // Porcentagem necessária para revelar automaticamente
const SCRATCH_RADIUS = 20;

onMounted(async () => {
  if (!canvasRef.value) return;
  
  ctx.value = canvasRef.value.getContext('2d');
  if (!ctx.value) return;
  
  // Comprar a raspadinha
  isRevealing.value = true;
  const result = await scratchCardStore.buyScratchCard(props.scratchCardId);
  isRevealing.value = false;
  
  if (!result) return;
  
  // Inicializar o canvas
  initCanvas();
  
  // Adicionar event listeners
  addEventListeners();
});

onUnmounted(() => {
  removeEventListeners();
});

watch(revealPercentage, (newValue) => {
  if (newValue >= REVEAL_THRESHOLD && !isRevealed.value) {
    revealAll();
  }
});

function initCanvas() {
  if (!canvasRef.value || !ctx.value) return;
  
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  
  // Ajustar o tamanho do canvas para corresponder ao tamanho exibido
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // Desenhar a camada de raspar
  ctx.value.fillStyle = '#333';
  ctx.value.fillRect(0, 0, canvas.width, canvas.height);
  
  // Adicionar texto "Raspe aqui"
  ctx.value.font = 'bold 24px Arial';
  ctx.value.fillStyle = '#fff';
  ctx.value.textAlign = 'center';
  ctx.value.textBaseline = 'middle';
  ctx.value.fillText('Raspe aqui!', canvas.width / 2, canvas.height / 2);
}

function addEventListeners() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  // Mouse events
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Touch events
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', stopDrawing);
}

function removeEventListeners() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  // Mouse events
  canvas.removeEventListener('mousedown', startDrawing);
  canvas.removeEventListener('mousemove', draw);
  canvas.removeEventListener('mouseup', stopDrawing);
  canvas.removeEventListener('mouseout', stopDrawing);
  
  // Touch events
  canvas.removeEventListener('touchstart', handleTouchStart);
  canvas.removeEventListener('touchmove', handleTouchMove);
  canvas.removeEventListener('touchend', stopDrawing);
}

function startDrawing(e: MouseEvent) {
  isDrawing.value = true;
  const { offsetX, offsetY } = e;
  lastX.value = offsetX;
  lastY.value = offsetY;
  
  // Desenhar um círculo no ponto inicial
  scratch(offsetX, offsetY);
}

function handleTouchStart(e: TouchEvent) {
  e.preventDefault();
  if (!canvasRef.value) return;
  
  const touch = e.touches[0];
  const rect = canvasRef.value.getBoundingClientRect();
  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;
  
  isDrawing.value = true;
  lastX.value = offsetX;
  lastY.value = offsetY;
  
  // Desenhar um círculo no ponto inicial
  scratch(offsetX, offsetY);
}

function draw(e: MouseEvent) {
  if (!isDrawing.value) return;
  
  const { offsetX, offsetY } = e;
  scratch(offsetX, offsetY);
  
  lastX.value = offsetX;
  lastY.value = offsetY;
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault();
  if (!isDrawing.value || !canvasRef.value) return;
  
  const touch = e.touches[0];
  const rect = canvasRef.value.getBoundingClientRect();
  const offsetX = touch.clientX - rect.left;
  const offsetY = touch.clientY - rect.top;
  
  scratch(offsetX, offsetY);
  
  lastX.value = offsetX;
  lastY.value = offsetY;
}

function scratch(x: number, y: number) {
  if (!ctx.value || !canvasRef.value) return;
  
  // Usar o modo de composição "destination-out" para criar o efeito de raspar
  ctx.value.globalCompositeOperation = 'destination-out';
  
  // Desenhar um círculo
  ctx.value.beginPath();
  ctx.value.arc(x, y, SCRATCH_RADIUS, 0, Math.PI * 2);
  ctx.value.fill();
  
  // Calcular a porcentagem revelada
  calculateRevealPercentage();
}

function stopDrawing() {
  isDrawing.value = false;
}

function calculateRevealPercentage() {
  if (!ctx.value || !canvasRef.value) return;
  
  const canvas = canvasRef.value;
  const imageData = ctx.value.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  let transparentPixels = 0;
  let totalPixels = pixels.length / 4;
  
  // Contar pixels transparentes (alpha = 0)
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) {
      transparentPixels++;
    }
  }
  
  // Calcular porcentagem
  revealPercentage.value = (transparentPixels / totalPixels) * 100;
}

async function revealAll() {
  if (!ctx.value || !canvasRef.value || !scratchCardStore.scratchCardResult) return;
  
  isRevealed.value = true;
  
  // Limpar o canvas completamente
  ctx.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // Revelar o resultado no backend
  await scratchCardStore.revealScratchCard(scratchCardStore.scratchCardResult.id);
  
  // Emitir o evento de conclusão
  const prize = scratchCardStore.scratchCardResult.prize || 0;
  emit('complete', prize);
  
  // Mostrar confetti se ganhou um prêmio
  if (prize > 0) {
    showConfetti();
  }
}

function showConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });
}
</script>

<template>
  <div class="scratch-card-container">
    <div v-if="isRevealing" class="loading-overlay">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      <p class="mt-4 text-white">Comprando raspadinha...</p>
    </div>
    
    <div v-else-if="!scratchCardStore.scratchCardResult" class="error-message">
      <p class="text-red-500">Erro ao comprar raspadinha. Tente novamente.</p>
      <p v-if="scratchCardStore.error" class="text-sm text-gray-400 mt-2">
        {{ scratchCardStore.error }}
      </p>
    </div>
    
    <div v-else class="scratch-card">
      <!-- Camada de resultado (abaixo do canvas) -->
      <div class="result-layer">
        <div v-if="scratchCardStore.scratchCardResult.prize && scratchCardStore.scratchCardResult.prize > 0" class="win-result">
          <div class="text-4xl mb-2">🎉</div>
          <h3 class="text-2xl font-bold text-white mb-2">Parabéns!</h3>
          <p class="text-xl text-primary-500 font-bold">
            R$ {{ scratchCardStore.scratchCardResult.prize.toFixed(2) }}
          </p>
        </div>
        <div v-else class="lose-result">
          <div class="text-4xl mb-2">😢</div>
          <h3 class="text-xl font-bold text-white mb-2">Não foi dessa vez!</h3>
          <p class="text-gray-400">Tente novamente</p>
        </div>
      </div>
      
      <!-- Canvas para raspar -->
      <canvas 
        ref="canvasRef"
        class="scratch-layer"
        :class="{ 'pointer-events-none': isRevealed }"
      ></canvas>
      
      <!-- Barra de progresso -->
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: `${revealPercentage}%` }"
          ></div>
        </div>
        <p class="progress-text">{{ Math.floor(revealPercentage) }}% revelado</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scratch-card-container {
  position: relative;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}

.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
}

.error-message {
  text-align: center;
  padding: 2rem;
}

.scratch-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.result-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #1f2937;
  z-index: 1;
  padding: 1rem;
  text-align: center;
}

.scratch-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  cursor: pointer;
}

.progress-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  z-index: 3;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #0ea5e9;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: white;
  text-align: center;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.win-result {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
</style>

<script lang="ts">
export default {
  name: 'ScratchCard'
}
</script> 