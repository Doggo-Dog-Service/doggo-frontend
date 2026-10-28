<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Dog } from 'lucide-vue-next'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useDogMood } from '@/composables/useDogMood'

// Cachorro 3D decorativo das telas de login e cadastro.
// O Three.js é carregado sob demanda; sem WebGL, com economia de dados ou pouca memória
// o componente mostra só um ícone. Com prefers-reduced-motion renderiza uma pose estática.
const props = defineProps({
  compact: { type: Boolean, default: false },
})

const { mood, setFocusMood, setAnimated, reset } = useDogMood()

const wrap = ref(null)
const canvas = ref(null)
const status = ref('loading') // 'loading' | 'ready' | 'fallback'
const sizeClass = computed(() => (props.compact ? 'h-32 w-40 md:h-40 md:w-48' : 'h-44 w-52 md:h-52 md:w-60'))

let scene = null
let unmounted = false
let visible = true
let typingTimer = null
let resizeObserver = null
let intersectionObserver = null

function canUse3d() {
  if (typeof window === 'undefined') return false
  const connection = navigator.connection
  if (connection?.saveData) return false
  if (navigator.deviceMemory && navigator.deviceMemory < 2) return false
  return true
}

function updateActive() {
  scene?.setActive(visible && !document.hidden)
}

function moodForField(el) {
  if (el?.tagName === 'TEXTAREA') return 'typing'
  if (el?.tagName !== 'INPUT') return null
  const type = (el.getAttribute('type') ?? 'text').toLowerCase()
  if (type === 'password') return 'shy'
  if (type === 'email') return 'curious'
  if (['checkbox', 'radio', 'file', 'button', 'submit', 'range', 'hidden'].includes(type)) return null
  return 'typing'
}

function onFocusIn(event) {
  const next = moodForField(event.target)
  if (next) setFocusMood(next)
}

function onFocusOut() {
  setFocusMood('idle')
}

// Digitar no email faz o cachorro abanar o rabo mais rápido por um instante.
function onInput(event) {
  if (mood.value !== 'curious' || moodForField(event.target) !== 'curious') return
  setFocusMood('typing')
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => setFocusMood('curious'), 700)
}

function onPointerMove(event) {
  if (!scene || !canvas.value) return
  const rect = canvas.value.getBoundingClientRect()
  const x = (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2)
  const y = -(event.clientY - (rect.top + rect.height * 0.3)) / (window.innerHeight / 2)
  scene.setPointer(x, y)
}

function fallback() {
  status.value = 'fallback'
  setAnimated(false)
  scene?.dispose()
  scene = null
}

onMounted(async () => {
  if (!canUse3d()) return fallback()
  try {
    const { createDogScene } = await import('@/utils/dogScene')
    if (unmounted) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    scene = createDogScene(canvas.value, { animated: !reduceMotion, onContextLost: fallback })
    scene.setMood(mood.value)
    status.value = 'ready'
    setAnimated(!reduceMotion)

    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    document.addEventListener('input', onInput)
    document.addEventListener('visibilitychange', updateActive)
    if (!reduceMotion) window.addEventListener('pointermove', onPointerMove, { passive: true })

    resizeObserver = new ResizeObserver(() => scene?.resize())
    resizeObserver.observe(wrap.value)
    intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateActive()
    })
    intersectionObserver.observe(wrap.value)
    updateActive()
  } catch {
    if (!unmounted) fallback()
  }
})

watch(mood, (value) => scene?.setMood(value))

onBeforeUnmount(() => {
  unmounted = true
  clearTimeout(typingTimer)
  document.removeEventListener('focusin', onFocusIn)
  document.removeEventListener('focusout', onFocusOut)
  document.removeEventListener('input', onInput)
  document.removeEventListener('visibilitychange', updateActive)
  window.removeEventListener('pointermove', onPointerMove)
  resizeObserver?.disconnect()
  intersectionObserver?.disconnect()
  scene?.dispose()
  scene = null
  reset()
})
</script>

<template>
  <div ref="wrap" :class="['pointer-events-none relative mx-auto select-none', sizeClass]" aria-hidden="true">
    <canvas
      ref="canvas"
      :class="[
        'absolute inset-0 size-full transition-opacity duration-300 motion-reduce:transition-none',
        status === 'ready' ? 'opacity-100' : 'opacity-0',
      ]"
    />
    <div v-if="status !== 'ready'" class="absolute inset-0 grid place-items-center">
      <span
        :class="[
          'grid size-24 place-items-center rounded-full bg-primary-soft text-primary',
          status === 'loading' ? 'animate-pulse motion-reduce:animate-none' : '',
        ]"
      >
        <UiIcon :icon="Dog" :size="44" />
      </span>
    </div>
  </div>
</template>
