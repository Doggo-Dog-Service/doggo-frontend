<script setup>
import InfoCard from '@/components/cards/InfoCard.vue'
import IconButton from '@/components/buttons/IconButton.vue'
import { petSizeConverter } from '@/utils/petSize.js'

const emits = defineEmits(['edit', 'delete'])

const props = defineProps({
  pet: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-4 items-center">
      <img
        v-if="props.pet.pet_picture?.url"
        :src="props.pet.pet_picture?.url"
        alt="pet-picture"
        class="h-50 w-50 object-cover rounded-xl"
      />
      <div v-else class="h-50 w-50 grid justify-center items-center bg-doggo-green/20 rounded-xl">
        <span class="mdi mdi-dog text-doggo-green text-5xl"></span>
      </div>
      <h1 class="text-center font-semibold text-2xl">{{ props.pet.name }}</h1>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <InfoCard
        v-if="props.pet.size"
        description="Porte"
        :info="petSizeConverter(props.pet.size)"
      />
      <InfoCard
        v-if="props.pet.weight"
        description="Peso"
        :info="`${Number(props.pet.weight)} kg`"
      />
      <InfoCard
        v-if="props.pet.breed"
        description="Raça"
        :info="props.pet.breed"
        class="col-span-2"
      />
      <div
        class="p-6 rounded-xl border border-doggo-gray col-span-2 bg-white"
        v-if="props.pet.notes"
      >
        <h2 class="font-semibold mb">Anotações</h2>
        <p>{{ props.pet.notes }}</p>
      </div>
    </div>
    <div class="flex gap-4 fixed bottom-16 right-12 md:bottom-12 md:right-46">
      <IconButton icon="mdi mdi-square-edit-outline" tooltip="Editar pet" @event="emits('edit')" />
      <IconButton icon="mdi mdi-delete" mode="red" tooltip="Deletar pet" @event="emits('delete')" />
    </div>
  </div>
</template>
