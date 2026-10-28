<script setup>
defineProps({
  shape: {
    type: String,
    default: 'text',
    validator: (v) => ['text', 'circle', 'rect'].includes(v),
  },
  lines: { type: Number, default: 1 },
})
</script>

<template>
  <div v-if="shape === 'text'" class="flex flex-col gap-2" aria-hidden="true">
    <div
      v-for="n in lines"
      :key="n"
      data-skeleton-line
      :class="[
        'h-4 animate-pulse rounded bg-surface-muted',
        n === lines && lines > 1 ? 'w-2/3' : 'w-full',
      ]"
    ></div>
  </div>
  <div
    v-else
    aria-hidden="true"
    :class="[
      'animate-pulse bg-surface-muted',
      shape === 'circle' ? 'size-10 rounded-full' : 'h-24 w-full rounded-control',
    ]"
  ></div>
</template>
