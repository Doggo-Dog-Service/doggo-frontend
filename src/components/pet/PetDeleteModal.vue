<script setup>
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
  <div class="flex flex-col items-center justify-center gap-8 pt-50">
    <div class="text-center">
      <span class="mdi mdi-alert-circle-outline text-6xl text-red-400"></span>
      <h2 class="mt-4 font-semibold text-xl">Deseja mesmo deletar esse pet?</h2>
      <p class="mt-2 text-sm text-gray-500">Essa ação não poderá ser desfeita.</p>
    </div>
    <div class="w-full max-w-xl grid grid-cols-2 gap-4">
      <AppButton :text="props.loading ? 'Deletando...' : 'Deletar'" mode="red" @event="emits('confirm')" />
      <AppButton text="Cancelar" @event="emits('cancel')" />
    </div>
  </div>
</template>
