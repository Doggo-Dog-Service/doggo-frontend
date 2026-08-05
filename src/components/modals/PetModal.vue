<script setup>
import ImageInput from '../inputs/ImageInput.vue'
import ChoseButton from '../buttons/ChoseButton.vue'
import AppInput from '../inputs/AppInput.vue'
import TextInput from '../inputs/TextInput.vue'
import IconButton from '../buttons/IconButton.vue'
import InfoCard from '../cards/InfoCard.vue'
import { petSizeConverter } from '@/utils/petSize.js'
import { usePetStore } from '@/stores/pet'
import { onMounted, reactive, ref } from 'vue'
import AppButton from '../buttons/AppButton.vue'

const petStore = usePetStore()

const emits = defineEmits(['close', 'changeMode'])

const props = defineProps({
  mode: {
    type: String,
    default: 'view',
    validator: (value) => ['view', 'add', 'edit'].includes(value),
  },
  pet_id: {
    type: Number,
  },
})

const sizeChoices = [
  { title: 'Pequeno', value: 'p' },
  { title: 'Médio', value: 'm' },
  { title: 'Grande', value: 'g' },
]

const petEditData = reactive({
  name: '',
  breed: '',
  size: '',
  weight: 0,
  notes: '',
})
const petEditPicutre = ref(null)
function resetEditData() {
  petEditData.name = petStore.currentPet.name
  petEditData.breed = petStore.currentPet.breed
  petEditData.size = petStore.currentPet.size
  petEditData.weight = petStore.currentPet.weight
  petEditData.notes = petStore.currentPet.notes
}

async function handleRegister() {}

async function handleUpdate() {
  await petStore.updatePet(props.pet_id, petEditData)
  emits('changeMode', 'view')
}

function cancelUpdate() {
  resetEditData()
  emits('changeMode', 'view')
}

onMounted(async () => {
  if (['view', 'edit'].includes(props.mode)) {
    await petStore.getPet(props.pet_id)
    resetEditData()
  }
})
</script>

<template>
  <div
    class="fixed bg-black/60 w-screen h-screen top-0 right-0 px-6 py-20 md:px-40 md:py-6 z-100"
    @click="emits('close')"
  >
    <div
      class="relative bg-background-light rounded-xl w-full h-full p-6 overflow-y-auto"
      @click.stop
    >
      <div v-if="props.mode == 'view'" class="flex flex-col gap-5">
        <img
          v-if="petStore.currentPet.pet_picture"
          :src="petStore.currentPet.pet_picture"
          alt="pet-picture"
          class="h-50 object-cover rounded-xl"
        />
        <div v-else class="h-50 grid justify-center items-center bg-doggo-green/20 rounded-xl">
          <span class="mdi mdi-dog text-doggo-green text-5xl"></span>
        </div>
        <h1 class="text-center font-semibold text-2xl">{{ petStore.currentPet.name }}</h1>
        <div class="grid grid-cols-2 gap-2">
          <InfoCard description="Porte" :info="petSizeConverter(petStore.currentPet.size)" />
          <InfoCard description="Peso" :info="`${Number(petStore.currentPet.weight)} kg`" />
          <InfoCard description="Raça" :info="petStore.currentPet.breed" class="col-span-2" />
          <div
            class="p-6 rounded-xl border border-doggo-gray col-span-2 bg-white"
            v-if="petStore.currentPet.notes"
          >
            <p>{{ petStore.currentPet.notes }}</p>
          </div>
        </div>
        <IconButton
          icon="mdi mdi-square-edit-outline"
          tooltip="Editar"
          class="fixed bottom-26 right-12"
          @event="emits('changeMode', 'edit')"
        />
      </div>

      <form
        v-else-if="props.mode == 'edit'"
        @submit.prevent="handleUpdate"
        class="flex flex-col gap-4"
      >
        <ImageInput label="Foto do seu Pet" v-model="petEditPicutre" />
        <AppInput label="Nome" placeholder="Nome do seu Pet" required v-model="petEditData.name" />
        <div class="flex gap-4 items-center">
          <AppInput label="Raça" placeholder="Raça do seu Pet" v-model="petEditData.breed" />
          <AppInput label="Peso" placeholder="0" type="number" v-model="petEditData.weight" />
        </div>
        <div class="flex gap-4 items-center">
          <ChoseButton
            v-for="(choice, index) in sizeChoices"
            :key="index"
            :text="choice.title"
            :selected="petEditData.size == choice.value"
            @select="petEditData.size = choice.value"
          />
        </div>
        <TextInput
          placeholder="Adicione alguma nota importante sobre seu pet"
          label="Notas"
          v-model="petEditData.notes"
        />
        <div class="absolute bottom-6 right-6 left-6 grid grid-cols-2 items-center gap-4">
          <AppButton
            :text="petStore.loading ? 'Salvando...' : 'Salvar'"
            mode="outline"
            type="submit"
          />
          <AppButton text="Cancelar" mode="red" @event="cancelUpdate" />
        </div>
      </form>

      <form v-else-if="props.mode == 'add'" @submit.prevent="handleRegister"></form>
    </div>
  </div>
</template>
