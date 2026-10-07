<script setup>
import { ref } from 'vue'
import { StarIcon } from '@heroicons/vue/24/solid'

const rating = defineModel({
  type: Number,
  default: 0,
})

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
})

const hoverRating = ref(0)
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <span v-if="props.label" class="text-sm font-medium text-gray-700">
      {{ props.label }}
    </span>

    <div
      class="flex gap-1"
      role="radiogroup"
      :aria-label="props.label || 'Avaliação'"
      @mouseleave="hoverRating = 0"
    >
      <button
        v-for="value in 5"
        :key="value"
        type="button"
        class="size-9 transition-transform cursor-pointer duration-150 hover:scale-110"
        :aria-label="`Avaliar com ${value} estrelas`"
        @mouseenter="hoverRating = value"
        @click="rating = value"
      >
        <StarIcon
          class="size-full transition-colors duration-150"
          :class="value <= (hoverRating || rating) ? 'text-yellow-400' : 'text-gray-300'"
        />
      </button>
    </div>
  </div>
</template>
