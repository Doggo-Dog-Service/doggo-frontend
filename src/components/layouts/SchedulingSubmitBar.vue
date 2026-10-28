<script setup>
import AppButton from '@/components/buttons/AppButton.vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    default: 'Confirmar agendamento',
  },
})

const emit = defineEmits(['submit'])
</script>

<template>
  <div
    class="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 md:static md:inset-auto md:mt-2"
  >
    <p v-if="props.error" role="alert" class="mb-2 rounded-control bg-danger-soft px-3 py-2 text-caption font-semibold text-danger">{{ props.error }}</p>
    <AppButton
      :disabled="props.disabled"
      :text="props.loading ? 'Enviando...' : props.text"
      variant="primary"
      @event="emit('submit')"
    />
  </div>
</template>
