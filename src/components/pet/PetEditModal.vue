<script setup>
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
  <form @submit.prevent="emits('submit')" class="grid gap-4 lg:grid-cols-2 lg:items-end">
    <div class="w-full flex items-center justify-center gap-4">
      <img
        v-if="props.preview"
        class="w-32 h-32 rounded-4xl object-cover"
        :src="props.preview"
        alt="pet-preview"
      />
      <span v-if="props.preview" class="mdi mdi-arrow-right"></span>
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
    <div class="flex flex-col gap-2">
      <p class="font-semibold text-sm">Porte</p>
      <div class="flex gap-4 items-center lg:flex-col">
        <ChoseButton
          v-for="(choice, index) in PET_SIZE_OPTIONS"
          :key="index"
          :text="choice.title"
          :selected="form.size == choice.value"
          @select="form.size = choice.value"
        />
      </div>
    </div>
    <TextInput
      placeholder="Adicione alguma nota importante sobre seu pet"
      label="Notas"
      v-model="form.notes"
    />
    <div
      class="absolute bottom-6 right-6 left-6 grid grid-cols-2 items-center gap-4 lg:left-20 lg:right-20"
    >
      <AppButton :text="props.loading ? 'Salvando...' : 'Salvar'" mode="outline" type="submit" />
      <AppButton text="Voltar" @event="emits('cancel')" />
    </div>
  </form>
</template>
