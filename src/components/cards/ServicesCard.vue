<script setup>
import UiIcon from '@/components/ui/UiIcon.vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  link: {
    type: String,
    default: '/',
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'green'].includes(value),
  },
})
</script>

<template>
  <RouterLink
    :to="props.link"
    :class="[
      'flex flex-col gap-2 rounded-card border p-4 transition-colors duration-200 active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      props.type === 'default' && 'border-line bg-surface hover:bg-surface-muted',
      props.type === 'green' && 'border-primary/20 bg-primary-soft text-primary hover:border-primary/40',
    ]"
  >
    <div class="flex items-center gap-3">
      <span
        v-if="props.icon"
        :class="[
          'flex size-10 shrink-0 items-center justify-center rounded-control',
          props.type === 'default' && 'bg-surface-muted text-fg',
          props.type === 'green' && 'bg-surface text-primary',
        ]"
      >
        <UiIcon :icon="props.icon" :size="20" />
      </span>
      <h3 class="text-subtitle">{{ props.title }}</h3>
    </div>
    <p class="text-caption text-fg-muted">
      {{ props.description }}
    </p>
  </RouterLink>
</template>
