<script setup>
import { computed } from 'vue'

const props = defineProps({
  current: { type: Number, required: true },
  total: { type: Number, required: true },
  label: { type: String, default: 'Etapa' },
})

const percent = computed(() => Math.min(100, Math.max(0, (props.current / props.total) * 100)))
</script>

<template>
  <div class="flex flex-col gap-2">
    <p class="text-caption font-semibold text-fg-muted">{{ props.label }} {{ props.current }} de {{ props.total }}</p>
    <div
      role="progressbar"
      :aria-valuemin="1"
      :aria-valuemax="props.total"
      :aria-valuenow="props.current"
      :aria-valuetext="`${props.label} ${props.current} de ${props.total}`"
      class="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted"
    >
      <div
        class="h-full rounded-full bg-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>
