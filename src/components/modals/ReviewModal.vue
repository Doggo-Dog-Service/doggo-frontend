<script setup>
import { computed } from 'vue'

import UiSheet from '../ui/UiSheet.vue'
import TextInput from '../inputs/TextInput.vue'
import RatingInput from '../inputs/RatingInput.vue'
import AppButton from '../buttons/AppButton.vue'

const emits = defineEmits(['createReview', 'closeModal'])
const props = defineProps({
  providerName: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const rating = defineModel('rating')
const comment = defineModel('comment')

const placeholder = computed(() => `Deixe um comentário sobre o serviço de  ${props.providerName}`)
</script>

<template>
  <UiSheet
    :open="true"
    title="Avaliar serviço"
    @update:open="(value) => !value && emits('closeModal')"
  >
    <form @submit.prevent="emits('createReview')" class="flex flex-col items-center gap-5">
      <RatingInput v-model="rating" label="Avalie como foi o serviço" />
      <TextInput v-model="comment" :placeholder="placeholder" required />
      <AppButton
        :text="props.loading ? 'Enviando feedback...' : 'Enviar feedback'"
        variant="primary"
        type="submit"
        :disabled="props.loading"
      />
    </form>
  </UiSheet>
</template>
