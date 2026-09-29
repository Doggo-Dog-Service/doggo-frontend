<script setup>
import { computed } from 'vue'

import AppButton from '@/components/buttons/AppButton.vue'

const emit = defineEmits(['confirm', 'reject', 'start', 'complete', 'cancel'])

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  busy: {
    type: Boolean,
    default: false,
  },
})

const buttons = computed(() => {
  if (props.status === 1) {
    return props.role === 'provider'
      ? [
          { key: 'confirm', text: 'Confirmar', mode: 'outline' },
          { key: 'reject', text: 'Recusar', mode: 'red' },
        ]
      : [{ key: 'cancel', text: 'Cancelar solicitação', mode: 'red' }]
  }

  if (props.status === 2) {
    return props.role === 'provider'
      ? [
          { key: 'start', text: 'Iniciar passeio', mode: 'outline' },
          { key: 'cancel', text: 'Cancelar', mode: 'red' },
        ]
      : [{ key: 'cancel', text: 'Cancelar', mode: 'red' }]
  }

  if (props.status === 3) {
    return props.role === 'provider'
      ? [
          { key: 'complete', text: 'Concluir passeio', mode: 'outline' },
          { key: 'cancel', text: 'Cancelar', mode: 'red' },
        ]
      : []
  }

  return []
})

function handle(key) {
  emit(key)
}
</script>

<template>
  <div v-if="buttons.length > 0" class="w-full flex flex-col gap-2">
    <AppButton
      v-for="button in buttons"
      :key="button.key"
      :text="button.text"
      :mode="button.mode"
      :disabled="busy"
      @event="handle(button.key)"
    />
  </div>
</template>