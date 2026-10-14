<script setup>
import AppInput from '@/components/inputs/AppInput.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import ImageInput from '@/components/inputs/ImageInput.vue'
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { PET_SIZE_OPTIONS } from '@/utils/petSize.js'

const form = defineModel()
const picture = defineModel('picture')

const emits = defineEmits(['submit'])

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <form @submit.prevent="emits('submit')" class="grid gap-4 lg:grid-cols-2 lg:items-end">
    <ImageInput v-model="picture" />
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
    <div class="absolute bottom-6 right-6 left-6 lg:left-20 lg:right-20">
      <AppButton
        class="md:w-50"
        :text="props.loading ? 'Criando...' : 'Criar'"
        mode="outline"
        type="submit"
      />
    </div>
  </form>
</template>
