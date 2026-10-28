<script setup>
import { Star } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'

const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})
</script>
<template>
  <div class="rounded-card border border-line bg-surface p-5 shadow-card">
    <div class="flex items-start gap-3">
      <UiAvatar :src="props.review.client_picture" :name="props.review.client_name" />
      <div class="min-w-0 flex-1">
        <h3 class="text-subtitle text-fg">
          {{ props.review.client_name }}
        </h3>
        <div class="mt-1 flex" role="img" :aria-label="`Nota ${props.review.rating} de 5`">
          <Star
            v-for="star in 5"
            :key="star"
            :size="16"
            :stroke-width="2"
            :fill="star <= props.review.rating ? 'currentColor' : 'none'"
            :class="star <= props.review.rating ? 'text-warning' : 'text-fg-subtle'"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
    <p class="mt-3 text-body text-fg wrap-break-word whitespace-pre-wrap">
      {{ props.review.comment }}
    </p>
  </div>
</template>
