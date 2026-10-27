<script setup>
import { computed } from 'vue'
import { Loader2 } from 'lucide-vue-next'
import UiIcon from '@/components/ui/UiIcon.vue'

const emits = defineEmits(['event'])
const props = defineProps({
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  text: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'outline', 'red'].includes(value),
  },
  selected: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: undefined,
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value),
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value),
  },
  icon: {
    type: [Object, Function, String],
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: true,
  },
})

const MODE_TO_VARIANT = { default: 'secondary', outline: 'primary', red: 'danger' }

const VARIANTS = {
  primary: 'bg-primary text-primary-fg border-primary hover:opacity-90',
  secondary: 'bg-surface text-fg border-line hover:bg-surface-muted',
  ghost: 'bg-transparent text-fg border-transparent hover:bg-surface-muted',
  danger: 'bg-danger text-primary-fg border-danger hover:opacity-90',
}

const SIZES = {
  sm: 'min-h-10 px-3 text-caption',
  md: 'min-h-11 px-4 text-body',
  lg: 'min-h-12 px-6 text-subtitle',
}

const resolvedVariant = computed(() => props.variant ?? MODE_TO_VARIANT[props.mode])
const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    :disabled="isDisabled"
    :type="props.type"
    :data-variant="resolvedVariant"
    :aria-busy="props.loading || undefined"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-all duration-200 cursor-pointer active:scale-98 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
      VARIANTS[resolvedVariant],
      SIZES[props.size],
      props.block && 'w-full',
      isDisabled && 'opacity-60 cursor-not-allowed',
    ]"
    @click="emits('event')"
  >
    <Loader2 v-if="props.loading" :size="20" :stroke-width="2" class="animate-spin" aria-hidden="true" />
    <UiIcon v-else-if="props.icon" :icon="props.icon" />
    {{ props.text }}
  </button>
</template>
