<script setup>
import AppInput from '@/components/inputs/AppInput.vue'
import ImageInput from '@/components/inputs/ImageInput.vue'
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import { useSignupWizard } from '@/composables/useSignupWizard'
import { PET_SIZE_OPTIONS } from '@/utils/petSize.js'

const { pet, errors } = useSignupWizard()
</script>

<template>
  <div class="flex flex-col gap-5">
    <p class="text-body text-fg-muted">Cadastre seu cão agora ou faça isso depois, na aba Pets.</p>
    <ImageInput v-model="pet.photo" label="Foto do pet (opcional)" />
    <AppInput v-model="pet.name" label="Nome" placeholder="Nome do seu pet" :error="errors.name" required />
    <div class="grid grid-cols-2 gap-4">
      <AppInput v-model="pet.breed" label="Raça" placeholder="Raça do seu pet" />
      <AppInput v-model="pet.weight" label="Peso (kg)" placeholder="0" type="number" />
    </div>
    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 text-caption font-semibold text-fg">
        Porte <span class="text-danger" aria-hidden="true">*</span>
      </legend>
      <div class="grid grid-cols-3 gap-2">
        <ChoseButton
          v-for="choice in PET_SIZE_OPTIONS"
          :key="choice.value"
          :text="choice.title"
          :selected="pet.size === choice.value"
          @select="pet.size = choice.value"
        />
      </div>
      <p v-if="errors.size" role="alert" class="text-caption text-danger">{{ errors.size }}</p>
    </fieldset>
  </div>
</template>
