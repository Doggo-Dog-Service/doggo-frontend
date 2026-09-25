<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppButton from '@/components/buttons/AppButton.vue'

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
  'w-full py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer',
  active ? 'bg-doggo-green text-white' : 'bg-white border border-doggo-gray text-gray-400',
]

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
      <div class="fixed inset-0 bg-black/40 md:hidden" @click="close"></div>
      <div
        class="relative bg-white rounded-t-2xl md:rounded-2xl border border-doggo-gray p-5 max-h-[85vh] overflow-y-auto md:max-h-none"
      >
        <div class="flex items-center justify-between mb-5 md:hidden">
          <h2 class="text-lg font-bold text-doggo-black">Filtros</h2>
          <button class="text-gray-400 cursor-pointer" @click="close">
            <span class="mdi mdi-close text-xl"></span>
          </button>
        </div>

        <h2 class="text-xl font-bold text-doggo-black">Preço</h2>
        <div class="mt-4 flex items-end gap-2">
          <div class="flex-1">
            <label class="block text-xs text-gray-400 mb-1">Mínimo</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input
                v-model.number="filters.minPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                class="w-full h-9 pl-8 pr-3 rounded-lg border border-doggo-gray text-sm placeholder:text-gray-300 focus:outline-none focus:border-doggo-green transition-all duration-200"
              />
            </div>
          </div>  
          <div class="flex-1">
            <label class="block text-xs text-gray-400 mb-1">Máximo</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">R$</span>
              <input
                v-model.number="filters.maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="100"
                class="w-full h-9 pl-8 pr-3 rounded-lg border border-doggo-gray text-sm placeholder:text-gray-300 focus:outline-none focus:border-doggo-green transition-all duration-200"
              />
            </div>
          </div>
        </div>

        <h2 class="mt-6 text-xl font-bold text-doggo-black">Tipo</h2>
        <div class="mt-3 flex flex-col gap-2">
          <button :class="pillClasses(filters.serviceType == null)" @click="filters.serviceType = null">
            Todos
          </button>
          <button
            v-for="type in props.serviceTypes"
            :key="type.id"
            :class="pillClasses(filters.serviceType === type.id)"
            @click="filters.serviceType = type.id"
          >
            {{ type.name }}
          </button>
        </div>

        <h2 class="mt-6 text-xl font-bold text-doggo-black">Distância</h2>
        <div class="relative mt-7">
          <div
            class="absolute -top-6 -translate-x-1/2 px-2 py-0.5 rounded-md bg-doggo-green text-white text-[11px] font-semibold"
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
            :disabled="!props.distanceEnabled"
            :style="{ '--fill': sliderPercent }"
            class="slider"
          />
          <div class="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>5 km</span>
            <span>100 km</span>
          </div>
        </div>
        <p v-if="!props.distanceEnabled" class="mt-2 text-[11px] text-gray-400">
          Ative a localização para filtrar por distância.
        </p>

        <div class="flex gap-2 mt-6">
          <AppButton mode="outline" text="Filtrar" @event="apply" class="flex-1" />
          <AppButton text="Limpar" @event="clear" class="flex-1" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.panel-enter-from,
.panel-leave-to {
  transform: translateY(100%);
  opacity: 0;
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
    var(--color-doggo-green) 0%,
    var(--color-doggo-green) var(--fill),
    var(--color-doggo-gray) var(--fill),
    var(--color-doggo-gray) 100%
  );
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--color-doggo-green);
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}

.slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 9999px;
  background: var(--color-doggo-green);
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
}
</style>
