<script setup>
import { ArrowRight } from 'lucide-vue-next'
import AppInput from '@/components/inputs/AppInput.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import ImageInput from '@/components/inputs/ImageInput.vue'
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { PET_SIZE_OPTIONS } from '@/utils/petSize.js'

const form = defineModel()
const picture = defineModel('picture')

const emits = defineEmits(['submit', 'cancel'])

const props = defineProps({
  preview: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <form @submit.prevent="emits('submit')" class="flex flex-col gap-4">
    <div class="flex w-full items-center justify-center gap-4">
      <img
        v-if="props.preview"
        class="size-32 rounded-card object-cover"
        :src="props.preview"
        alt="Foto atual do pet"
      />
      <ArrowRight
        v-if="props.preview"
        :size="20"
        :stroke-width="2"
        class="shrink-0 text-fg-muted"
        aria-hidden="true"
      />
      <ImageInput v-model="picture" :edit="!!props.preview" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <AppInput
        class="col-span-2"
        label="Nome"
        placeholder="Nome do seu Pet"
        required
        v-model="form.name"
      />
      <AppInput label="Raça" placeholder="Raça do seu Pet" v-model="form.breed" />
      <AppInput label="Peso (kg)" placeholder="0" type="number" v-model="form.weight" />
    </div>
    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 text-caption font-semibold text-fg">Porte</legend>
      <div class="grid grid-cols-3 gap-2">
        <ChoseButton
          v-for="(choice, index) in PET_SIZE_OPTIONS"
          :key="index"
          :text="choice.title"
          :selected="form.size == choice.value"
          @select="form.size = choice.value"
        />
      </div>
    </fieldset>
    <TextInput
      placeholder="Adicione alguma nota importante sobre seu pet"
      label="Notas"
      v-model="form.notes"
    />
    <div class="grid grid-cols-2 items-center gap-3">
      <AppButton :text="props.loading ? 'Salvando...' : 'Salvar'" variant="primary" type="submit" />
      <AppButton text="Voltar" @event="emits('cancel')" />
    </div>
  </form>
</template>
