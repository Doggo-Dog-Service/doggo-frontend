<script setup>
import { ref } from 'vue'
import { Camera, Loader2 } from 'lucide-vue-next'

import { WALK_EVENT_KINDS } from '@/utils/walkEvents'

defineProps({
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['mark'])

const KINDS = ['pee', 'poop', 'water']
const photoInput = ref(null)

function onPhoto(event) {
  const file = event.target.files?.[0]

  // Permite escolher a mesma foto de novo depois.
  event.target.value = ''

  if (file) emit('mark', 'photo', file)
}

const buttonClass =
  'flex min-h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-control border border-line bg-surface px-1 text-caption font-semibold text-fg transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60'
</script>

<template>
  <div class="grid grid-cols-4 gap-2" role="group" aria-label="Marcar no passeio">
    <button
      v-for="kind in KINDS"
      :key="kind"
      type="button"
      :data-event-kind="kind"
      :[`data-event-${kind}`]="''"
      :disabled="disabled"
      :class="buttonClass"
      @click="emit('mark', kind)"
    >
      <component :is="WALK_EVENT_KINDS[kind].icon" :size="20" :stroke-width="2" aria-hidden="true" />
      {{ WALK_EVENT_KINDS[kind].label }}
    </button>

    <button
      type="button"
      data-event-photo
      :disabled="disabled"
      :class="buttonClass"
      @click="photoInput?.click()"
    >
      <Loader2 v-if="disabled" :size="20" :stroke-width="2" class="animate-spin" aria-hidden="true" />
      <Camera v-else :size="20" :stroke-width="2" aria-hidden="true" />
      Foto
    </button>
    <input
      ref="photoInput"
      type="file"
      accept="image/*"
      capture="environment"
      data-event-photo-input
      class="sr-only"
      tabindex="-1"
      aria-hidden="true"
      @change="onPhoto"
    />
  </div>
</template>
