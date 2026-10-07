<script setup>
import { computed } from 'vue'

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
  <div
    class="fixed flex justify-center items-center bg-black/60 w-screen h-screen top-0 right-0 z-100"
    @click="emits('closeModal')"
  >
    <form
      @submit.prevent="emits('createReview')"
      @click.stop
      class="relative flex flex-col justify-center items-center bg-background-light rounded-xl w-3/4 h-fit p-6 gap-5 overflow-y-auto md:w-1/3"
    >
      <div class="w-full text-end">
        <button
          class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 cursor-pointer"
          @click="emits('closeModal')"
        >
          <span class="mdi mdi-close"></span>
        </button>
      </div>
      <RatingInput v-model="rating" label="Avallie como foi o serviço" />
      <TextInput v-model="comment" :placeholder="placeholder" required />
      <AppButton
        :text="props.loading ? 'Enviando feedback...' : 'Enviar feedback'"
        mode="outline"
        type="submit"
        :disabled="props.loading"
      />
    </form>
  </div>
</template>
