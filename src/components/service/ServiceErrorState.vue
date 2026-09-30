<script setup>
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
    <span class="mdi mdi-alert-circle-outline text-5xl text-doggo-green"></span>
    <p class="text-doggo-black/70 font-semibold">
      {{ message || 'Não foi possível carregar o serviço.' }}
    </p>
    <AppButton text="Tentar novamente" mode="outline" @event="$emit('retry')" />
  </div>
</template>