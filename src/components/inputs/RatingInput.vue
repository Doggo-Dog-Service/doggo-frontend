<script setup>
import { ref } from 'vue'
import { Star } from 'lucide-vue-next'

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
    <span v-if="props.label" class="text-caption font-semibold text-fg">
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
        role="radio"
        :aria-checked="rating === value"
        class="flex size-11 cursor-pointer items-center justify-center rounded-full transition-transform duration-150 hover:scale-110 focus-visible:ring-2 focus-visible:ring-primary"
        :aria-label="`Avaliar com ${value} estrelas`"
        @mouseenter="hoverRating = value"
        @click="rating = value"
      >
        <Star
          :size="32"
          :stroke-width="2"
          aria-hidden="true"
          class="transition-colors duration-150"
          :class="
            value <= (hoverRating || rating)
              ? 'fill-warning text-warning'
              : 'fill-transparent text-fg-subtle'
          "
        />
      </button>
    </div>
  </div>
</template>
