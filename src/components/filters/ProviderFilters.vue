<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { X } from 'lucide-vue-next'
import AppButton from '@/components/buttons/AppButton.vue'
import IconButton from '@/components/buttons/IconButton.vue'

const open = defineModel('open', { type: Boolean, default: false })
const filters = defineModel('filters', { type: Object, default: () => ({}) })

const props = defineProps({
  serviceTypes: {
    type: Array,
    default: () => [],
  },
  distanceEnabled: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['apply', 'clear', 'close'])

const mediaQuery = window.matchMedia('(min-width: 768px)')
const isDesktop = ref(mediaQuery.matches)

const handleMediaChange = (event) => {
  isDesktop.value = event.matches
  if (event.matches) {
    open.value = true
  }
}

onMounted(() => {
  if (isDesktop.value) {
    open.value = false
  }
  mediaQuery.addEventListener('change', handleMediaChange)
})

onBeforeUnmount(() => {
  mediaQuery.removeEventListener('change', handleMediaChange)
})

const sliderPercent = computed(() => {
  const value = Number(filters.value.maxDistance ?? 50)
  const percent = ((value - 5) / 95) * 100
  return `${Math.min(95, Math.max(5, percent))}%`
})

const pillClasses = (active) => [
  'w-full min-h-11 py-2 rounded-full border text-body font-semibold transition-colors duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary',
  active
    ? 'bg-primary border-primary text-primary-fg'
    : 'bg-surface border-line text-fg-muted hover:bg-surface-muted',
]

const inputClasses =
  'w-full min-h-11 pl-9 pr-3 rounded-control border border-line bg-surface text-body text-fg placeholder:text-fg-subtle focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary transition-colors duration-200'

const apply = () => {
  emits('apply')
  if (!isDesktop.value) {
    open.value = false
  }
}

const clear = () => {
  emits('clear')
  if (!isDesktop.value) {
    open.value = false
  }
}

const close = () => {
  emits('close')
}
</script>

<template>
  <Transition name="panel">
    <div v-if="open" class="fixed inset-x-0 bottom-0 z-60 md:static md:inset-auto md:z-auto">
      <div class="fixed inset-0 bg-neutral-950/50 md:hidden" @click="close"></div>
      <div
        class="relative max-h-[85vh] overflow-y-auto rounded-t-card border border-line bg-surface p-5 md:max-h-none md:rounded-card md:shadow-card"
      >
        <div class="mb-5 flex items-center justify-between md:hidden">
          <h2 class="text-title text-fg">Filtros</h2>
          <IconButton :icon="X" label="Fechar filtros" @event="close" />
        </div>

        <h2 class="text-subtitle text-fg">Preço</h2>
        <div class="mt-3 flex items-end gap-2">
          <label class="flex-1">
            <span class="mb-1 block text-caption font-semibold text-fg-muted">Mínimo</span>
            <span class="relative block">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-caption text-fg-muted">R$</span>
              <input
                v-model.number="filters.minPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                :class="inputClasses"
              />
            </span>
          </label>
          <label class="flex-1">
            <span class="mb-1 block text-caption font-semibold text-fg-muted">Máximo</span>
            <span class="relative block">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-caption text-fg-muted">R$</span>
              <input
                v-model.number="filters.maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="100"
                :class="inputClasses"
              />
            </span>
          </label>
        </div>

        <h2 class="mt-6 text-subtitle text-fg">Tipo</h2>
        <div class="mt-3 flex flex-col gap-2">
          <button
            type="button"
            :class="pillClasses(filters.serviceType == null)"
            :aria-pressed="filters.serviceType == null"
            @click="filters.serviceType = null"
          >
            Todos
          </button>
          <button
            v-for="type in props.serviceTypes"
            :key="type.id"
            type="button"
            :class="pillClasses(filters.serviceType === type.id)"
            :aria-pressed="filters.serviceType === type.id"
            @click="filters.serviceType = type.id"
          >
            {{ type.name }}
          </button>
        </div>

        <h2 class="mt-6 text-subtitle text-fg">Distância</h2>
        <div class="relative mt-8">
          <div
            class="absolute -top-7 -translate-x-1/2 rounded-md bg-primary px-2 py-0.5 text-caption font-semibold text-primary-fg"
            :style="{ left: sliderPercent }"
          >
            {{ filters.maxDistance }}
          </div>
          <input
            v-model.number="filters.maxDistance"
            type="range"
            min="5"
            max="100"
            step="5"
            aria-label="Distância máxima em quilômetros"
            :disabled="!props.distanceEnabled"
            :style="{ '--fill': sliderPercent }"
            class="slider"
          />
          <div class="mt-1 flex justify-between text-caption text-fg-muted">
            <span>5 km</span>
            <span>100 km</span>
          </div>
        </div>
        <p v-if="!props.distanceEnabled" class="mt-2 text-caption text-fg-muted">
          Ative a localização para filtrar por distância.
        </p>

        <div class="mt-6 flex gap-2">
          <AppButton variant="primary" text="Filtrar" @event="apply" class="flex-1" />
          <AppButton variant="secondary" text="Limpar" @event="clear" class="flex-1" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition:
    transform 0.2s ease,
    opacity 0.2s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .panel-enter-active,
  .panel-leave-active {
    transition: none;
  }
}

.slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  border-radius: 9999px;
  outline: none;
  cursor: pointer;
  background: linear-gradient(
    to right,
    var(--primary) 0%,
    var(--primary) var(--fill),
    var(--line) var(--fill),
    var(--line) 100%
  );
}

.slider:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 4px;
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: var(--primary);
  border: 2px solid var(--surface);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 9999px;
  background: var(--primary);
  border: 2px solid var(--surface);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}
</style>
