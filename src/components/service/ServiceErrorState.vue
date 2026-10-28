<script setup>
import { AlertCircle } from 'lucide-vue-next'
import AppButton from '@/components/buttons/AppButton.vue'

defineEmits(['retry'])

defineProps({
  message: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="w-full h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
    <AlertCircle :size="48" :stroke-width="1.75" class="text-danger" aria-hidden="true" />
    <p class="text-body text-fg-muted" role="alert">
      {{ message || 'Não foi possível carregar o serviço.' }}
    </p>
    <AppButton text="Tentar novamente" mode="outline" @event="$emit('retry')" />
  </div>
</template>