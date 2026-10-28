<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ChevronUp } from 'lucide-vue-next'

// 0 = recolhido (~96 px), 1 = médio (~45%), 2 = aberto (~85%)
const level = defineModel('level', { type: Number, default: 0 })

const HEIGHTS = ['96px', '45dvh', '85dvh']
const MAX_LEVEL = 2
const DRAG_THRESHOLD = 6

const sheet = ref(null)
const dragHeight = ref(null)
let startY = 0
let startHeight = 0
let moved = false

// No desktop o painel é lateral e sempre aberto.
const desktop = ref(false)
let media = null
const syncDesktop = () => {
  desktop.value = !!media?.matches
}
onMounted(() => {
  media = window.matchMedia?.('(min-width: 768px)') ?? null
  syncDesktop()
  media?.addEventListener?.('change', syncDesktop)
})
onBeforeUnmount(() => media?.removeEventListener?.('change', syncDesktop))

const expanded = computed(() => level.value > 0)
const height = computed(() => (dragHeight.value != null ? `${dragHeight.value}px` : HEIGHTS[level.value]))

function toggle() {
  level.value = expanded.value ? 0 : 1
}

function step(delta) {
  level.value = Math.min(MAX_LEVEL, Math.max(0, level.value + delta))
}

function onKeydown(event) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    step(1)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    step(-1)
  }
}

function levelHeightsPx() {
  const vh = window.innerHeight
  return [96, vh * 0.45, vh * 0.85]
}

function onPointerDown(event) {
  startY = event.clientY
  startHeight = sheet.value?.offsetHeight || levelHeightsPx()[level.value]
  moved = false
  event.currentTarget.setPointerCapture?.(event.pointerId)
}

function onPointerMove(event) {
  if (event.buttons === 0 && event.pointerType === 'mouse') return
  const dy = startY - event.clientY
  if (!moved && Math.abs(dy) < DRAG_THRESHOLD) return
  moved = true
  const [min, , max] = levelHeightsPx()
  dragHeight.value = Math.min(max, Math.max(min, startHeight + dy))
}

function onPointerUp(event) {
  event.currentTarget.releasePointerCapture?.(event.pointerId)
  if (!moved) {
    dragHeight.value = null
    return
  }
  const current = dragHeight.value
  const heights = levelHeightsPx()
  let nearest = 0
  heights.forEach((h, i) => {
    if (Math.abs(h - current) < Math.abs(heights[nearest] - current)) nearest = i
  })
  level.value = nearest
  dragHeight.value = null
}

// O clique sintético após um arraste não deve alternar a altura.
function onClick(event) {
  if (moved) {
    moved = false
    event.preventDefault()
    return
  }
  toggle()
}
</script>

<template>
  <section
    ref="sheet"
    data-live-sheet
    :data-level="level"
    aria-label="Detalhes do passeio"
    :style="{ '--sheet-h': height }"
    :class="[
      'absolute inset-x-0 bottom-0 z-10 flex h-(--sheet-h) flex-col overflow-hidden rounded-t-card border border-b-0 border-line bg-surface shadow-card',
      dragHeight == null && 'motion-safe:transition-[height] motion-safe:duration-200 motion-safe:ease-out',
      'md:inset-y-4 md:left-4 md:right-auto md:h-auto md:w-96 md:rounded-card md:border-b',
    ]"
  >
    <button
      type="button"
      data-sheet-toggle
      :aria-expanded="expanded"
      aria-label="Detalhes do passeio"
      class="flex h-6 w-full shrink-0 cursor-grab touch-none items-center justify-center text-fg-subtle focus-visible:ring-2 focus-visible:ring-primary active:cursor-grabbing md:hidden"
      @click="onClick"
      @keydown="onKeydown"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    >
      <span class="sr-only">{{ expanded ? 'Recolher detalhes' : 'Expandir detalhes' }}</span>
      <ChevronUp
        :size="20"
        :stroke-width="2.5"
        :class="['transition-transform motion-reduce:transition-none', expanded && 'rotate-180']"
        aria-hidden="true"
      />
    </button>

    <div class="shrink-0 px-4 pb-3 md:pt-4">
      <slot name="summary" />
    </div>

    <div
      data-sheet-body
      :inert="level === 0 && !desktop"
      class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
    >
      <slot />
    </div>
  </section>
</template>
