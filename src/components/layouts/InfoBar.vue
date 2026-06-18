<script setup>
import InfoCard from '../cards/InfoCard.vue'
import { useProvider } from '@/composables/useProvider'
import { computed } from 'vue'

const { experienceTime, experienceLabel } = useProvider()

const props = defineProps({
  reviews: {
    type: Array,
    required: true,
  },
})

const media = computed(() => {
  if (props.reviews?.length === 0) {
    return '--'
  }
  let total = 0
  for (let review of props.reviews) {
    total += review.rating
  }
  return Number(total / props.reviews?.length).toFixed(1)
})
</script>

<template>
  <div
    class="flex items-center w-full gap-2"
  >
    <InfoCard :info="media" description="Nota"/>
    <InfoCard :info="props.reviews?.length !== 0 ? props.reviews.length : '--'" description="Avaliações"/>
    <InfoCard :info="`${experienceTime} ${experienceLabel}`" description="Experiência"/>
  </div>
</template>
