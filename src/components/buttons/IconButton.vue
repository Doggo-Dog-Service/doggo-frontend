<script setup>
import { computed } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const emits = defineEmits(['event'])
const props = defineProps({
  // Componente Lucide; string (classe MDI) segue aceita até as telas migrarem.
  icon: {
    type: [Object, Function, String],
    required: true,
  },
  label: {
    type: String,
    default: undefined,
  },
  variant: {
    type: String,
    default: undefined,
    validator: (value) => ['ghost', 'secondary', 'primary'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  // Legado: 'red' mantém o botão vermelho dos chamadores atuais.
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'red'].includes(value),
  },
  // Legado: usado como rótulo quando `label` não é informado.
  tooltip: {
    type: String,
    required: false,
  },
})

const VARIANTS = {
  ghost: 'bg-transparent text-fg hover:bg-surface-muted',
  secondary: 'bg-surface-muted text-fg hover:opacity-80',
  primary: 'bg-primary text-primary-fg hover:opacity-90',
  danger: 'bg-danger text-primary-fg hover:opacity-90',
}

const accessibleLabel = computed(() => props.label ?? props.tooltip)
// Chamadores legados (sem `variant`) mantêm o visual preenchido atual.
const resolvedVariant = computed(
  () => props.variant ?? (props.mode === 'red' ? 'danger' : typeof props.icon === 'string' ? 'primary' : 'ghost'),
)
</script>

<template>
  <button
    :class="[
      'inline-flex size-11 items-center justify-center rounded-full transition-all duration-200 cursor-pointer active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      VARIANTS[resolvedVariant],
    ]"
    :type="props.type"
    :aria-label="accessibleLabel"
    :title="accessibleLabel"
    @click="emits('event')"
  >
    <UiIcon :icon="props.icon" :size="22" :class="typeof props.icon === 'string' && 'text-2xl'" />
  </button>
</template>
