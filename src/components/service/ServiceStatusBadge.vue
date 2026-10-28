<script setup>
import { computed } from 'vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { STATUS_META } from '@/utils/serviceStatus'

const props = defineProps({
  status: {
    type: Number,
    required: true,
  },
})

const meta = computed(
  () => STATUS_META[props.status] ?? { label: 'Desconhecido', tone: 'neutral', icon: null },
)
</script>

<template>
  <UiBadge :tone="meta.tone" :icon="meta.icon">{{ meta.label }}</UiBadge>
</template>
