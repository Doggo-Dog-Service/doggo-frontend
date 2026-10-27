<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import { X } from 'lucide-vue-next'

const open = defineModel('open', { type: Boolean, default: false })
defineProps({ title: { type: String, default: '' } })

const titleId = useId()
const panel = ref(null)
let previouslyFocused = null
let previousOverflow = ''

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function close() {
  open.value = false
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.stopPropagation()
    close()
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const items = [...panel.value.querySelectorAll(FOCUSABLE)]
  if (!items.length) {
    event.preventDefault()
    panel.value.focus()
    return
  }
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function lock() {
  previouslyFocused = document.activeElement
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlock() {
  document.body.style.overflow = previousOverflow
  previouslyFocused?.focus?.()
  previouslyFocused = null
}

watch(
  open,
  async (isOpen, wasOpen) => {
    if (isOpen) {
      lock()
      await nextTick()
      const first = panel.value?.querySelector(FOCUSABLE)
      ;(first ?? panel.value)?.focus()
    } else if (wasOpen) {
      unlock()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (open.value) unlock()
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      data-sheet-backdrop
      class="fixed inset-0 z-50 flex items-end justify-center bg-neutral-950/50 md:items-center md:p-4"
      @click.self="close"
    >
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        tabindex="-1"
        class="flex max-h-[90dvh] w-full flex-col gap-4 overflow-y-auto rounded-t-card bg-surface p-5 shadow-card outline-none md:max-w-lg md:rounded-card"
        @keydown="onKeydown"
      >
        <div class="flex items-center justify-between gap-3">
          <h2 :id="titleId" class="text-title text-fg">{{ title }}</h2>
          <button
            type="button"
            aria-label="Fechar"
            class="flex size-11 cursor-pointer items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary"
            @click="close"
          >
            <X :size="20" :stroke-width="2" aria-hidden="true" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
