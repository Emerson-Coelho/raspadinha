<script setup lang="ts">
import { computed } from 'vue';

interface LuckyNumberProps {
  number: number;
  isAvailable: boolean;
  isOwned: boolean;
  price: number;
  onClick?: (number: number) => void;
}

const props = defineProps<LuckyNumberProps>();

const buttonClass = computed(() => {
  if (props.isOwned) {
    return 'bg-primary-700 text-white cursor-default';
  } else if (props.isAvailable) {
    return 'bg-gray-700 hover:bg-gray-600 text-white cursor-pointer';
  } else {
    return 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50';
  }
});

function handleClick() {
  if (props.isAvailable && !props.isOwned && props.onClick) {
    props.onClick(props.number);
  }
}
</script>

<template>
  <button
    @click="handleClick"
    class="h-10 w-full rounded-md flex items-center justify-center font-medium transition-colors"
    :class="buttonClass"
    :disabled="!isAvailable || isOwned"
  >
    {{ number }}
  </button>
</template>

<script lang="ts">
export default {
  name: 'LuckyNumber'
}
</script> 