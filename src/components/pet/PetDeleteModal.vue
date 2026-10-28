<script setup>
import { AlertCircle } from 'lucide-vue-next'
import AppButton from '@/components/buttons/AppButton.vue'

const emits = defineEmits(['confirm', 'cancel'])

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <div class="flex flex-col items-center gap-2 text-center">
      <span class="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertCircle :size="28" :stroke-width="2" aria-hidden="true" />
      </span>
      <h3 class="text-subtitle text-fg">Deseja mesmo deletar esse pet?</h3>
      <p class="text-body text-fg-muted">Essa ação não poderá ser desfeita.</p>
    </div>
    <div class="grid grid-cols-2 gap-3">
      <AppButton
        :text="props.loading ? 'Deletando...' : 'Deletar'"
        variant="danger"
        @event="emits('confirm')"
      />
      <AppButton text="Cancelar" @event="emits('cancel')" />
    </div>
  </div>
</template>
