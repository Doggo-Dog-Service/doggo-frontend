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
    class="fixed bottom-22 left-0 right-0 px-6 md:relative md:bottom-auto md:left-auto md:right-auto md:px-0 md:mt-2"
  >
    <p v-if="props.error" class="text-red-700 text-sm font-semibold mb-2">{{ props.error }}</p>
    <AppButton
      :disabled="props.disabled"
      :text="props.loading ? 'Enviando...' : props.text"
      mode="outline"
      @event="emit('submit')"
    />
  </div>
</template>
