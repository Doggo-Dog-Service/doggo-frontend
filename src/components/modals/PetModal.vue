<script setup>
import ImageInput from '../inputs/ImageInput.vue'
import ChoseButton from '../buttons/ChoseButton.vue'
import AppInput from '../inputs/AppInput.vue'
import TextInput from '../inputs/TextInput.vue'
import IconButton from '../buttons/IconButton.vue'
import InfoCard from '../cards/InfoCard.vue'
import { petSizeConverter } from '@/utils/petSize.js'
import { usePetStore } from '@/stores/pet'
import { useMedia } from '@/composables/useMedia.js'
import { onMounted, reactive, ref } from 'vue'
import AppButton from '../buttons/AppButton.vue'

const petStore = usePetStore()
const { postImage } = useMedia()

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
const petRegisterData = reactive({
  name: '',
  breed: '',
  size: 'p',
  weight: 0,
  notes: '',
})

const petEditPicutre = ref(null)
const petEditPreview = ref('')
const petRegisterPicture = ref(null)

function resetEditData() {
  petEditData.name = petStore.currentPet.name
  petEditData.breed = petStore.currentPet.breed
  petEditData.size = petStore.currentPet.size
  petEditData.weight = petStore.currentPet.weight
  petEditData.notes = petStore.currentPet.notes
  petEditPreview.value = petStore.currentPet.pet_picture?.url
}

async function handleUpdate() {
  if (petEditPicutre.value) {
    const newImage = await postImage({
      file: petEditPicutre.value,
      description: petEditData.name,
    })
    if (newImage?.attachment_key) {
      petEditData.pet_picture = newImage.attachment_key
    } else {
      return
    }
  }

  await petStore.updatePet(props.pet_id, petEditData)
  emits('changeMode', 'view')
  petStore.getPet(props.pet_id)
}

async function handleRegister() {
  if (petRegisterPicture.value) {
    const newImage = await postImage({
      file: petRegisterPicture.value,
      description: petRegisterData.name,
    })
    if (newImage?.attachment_key) {
      petRegisterData.pet_picture = newImage.attachment_key
    } else {
      return
    }
  }

  await petStore.createPet(petRegisterData)
  emits('close')
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
    class="fixed bg-black/60 w-screen h-screen top-0 right-0 px-6 py-10 md:px-40 md:py-6 z-100"
    @click="emits('close')"
  >
    <div
      class="relative bg-background-light rounded-xl w-full h-full p-6 overflow-y-auto lg:px-20"
      @click.stop
    >
      <div class="w-full text-end mb-5">
        <button
          class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 cursor-pointer"
          @click="emits('close')"
        >
          <span class="mdi mdi-close"></span>
        </button>
      </div>
      <div v-if="props.mode == 'view'" class="flex flex-col gap-5">
        <div class="flex flex-col gap-4 items-center">
          <img
            v-if="petStore.currentPet.pet_picture?.url"
            :src="petStore.currentPet.pet_picture?.url"
            alt="pet-picture"
            class="h-50 w-50 object-cover rounded-xl"
          />
          <div
            v-else
            class="h-50 w-50 grid justify-center items-center bg-doggo-green/20 rounded-xl"
          >
            <span class="mdi mdi-dog text-doggo-green text-5xl"></span>
          </div>
          <h1 class="text-center font-semibold text-2xl">{{ petStore.currentPet.name }}</h1>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <InfoCard description="Porte" :info="petSizeConverter(petStore.currentPet.size)" />
          <InfoCard description="Peso" :info="`${Number(petStore.currentPet.weight)} kg`" />
          <InfoCard description="Raça" :info="petStore.currentPet.breed" class="col-span-2" />
          <div
            class="p-6 rounded-xl border border-doggo-gray col-span-2 bg-white"
            v-if="petStore.currentPet.notes"
          >
            <h2 class="font-semibold mb">Anotações</h2>
            <p>{{ petStore.currentPet.notes }}</p>
          </div>
        </div>
        <IconButton
          icon="mdi mdi-square-edit-outline"
          tooltip="Editar"
          class="fixed bottom-16 right-12 md:bottom-12 md:right-46"
          @event="emits('changeMode', 'edit')"
        />
      </div>

      <form
        v-else-if="props.mode == 'edit'"
        @submit.prevent="handleUpdate"
        class="grid gap-4 lg:grid-cols-2 lg:items-end"
      >
        <div class="w-full flex items-center justify-center gap-4">
          <img
            v-if="petEditPreview"
            class="w-32 h-32 rounded-4xl object-cover"
            :src="petEditPreview"
            alt="pet-preview"
          />
          <span v-if="petEditPreview" class="mdi mdi-arrow-right"></span>
          <ImageInput v-model="petEditPicutre" :edit="!!petEditPreview" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <AppInput
            class="col-span-2"
            label="Nome"
            placeholder="Nome do seu Pet"
            required
            v-model="petEditData.name"
          />
          <AppInput label="Raça" placeholder="Raça do seu Pet" v-model="petEditData.breed" />
          <AppInput label="Peso (kg)" placeholder="0" type="number" v-model="petEditData.weight" />
        </div>
        <div class="flex flex-col gap-2">
          <p class="font-semibold text-sm">Porte</p>
          <div class="flex gap-4 items-center lg:flex-col">
            <ChoseButton
              v-for="(choice, index) in sizeChoices"
              :key="index"
              :text="choice.title"
              :selected="petEditData.size == choice.value"
              @select="petEditData.size = choice.value"
            />
          </div>
        </div>
        <TextInput
          placeholder="Adicione alguma nota importante sobre seu pet"
          label="Notas"
          v-model="petEditData.notes"
        />
        <div
          class="absolute bottom-6 right-6 left-6 grid grid-cols-2 items-center gap-4 lg:left-20 lg:right-20"
        >
          <AppButton
            :text="petStore.loading ? 'Salvando...' : 'Salvar'"
            mode="outline"
            type="submit"
          />
          <AppButton text="Voltar" @event="cancelUpdate" />
        </div>
      </form>

      <form
        v-else-if="props.mode == 'add'"
        @submit.prevent="handleRegister"
        class="grid gap-4 lg:grid-cols-2 lg:items-end"
      >
        <ImageInput v-model="petRegisterPicture"/>
        <div class="grid grid-cols-2 gap-4">
          <AppInput
            class="col-span-2"
            label="Nome"
            placeholder="Nome do seu Pet"
            required
            v-model="petRegisterData.name"
          />
          <AppInput label="Raça" placeholder="Raça do seu Pet" v-model="petRegisterData.breed" />
          <AppInput label="Peso (kg)" placeholder="0" type="number" v-model="petRegisterData.weight" />
        </div>
        <div class="flex flex-col gap-2">
          <p class="font-semibold text-sm">Porte</p>
          <div class="flex gap-4 items-center lg:flex-col">
            <ChoseButton
              v-for="(choice, index) in sizeChoices"
              :key="index"
              :text="choice.title"
              :selected="petRegisterData.size == choice.value"
              @select="petRegisterData.size = choice.value"
            />
          </div>
        </div>
        <TextInput
          placeholder="Adicione alguma nota importante sobre seu pet"
          label="Notas"
          v-model="petRegisterData.notes"
        />
        <div
          class="absolute bottom-6 right-6 left-6 lg:left-20 lg:right-20"
        >
          <AppButton
            class="md:w-50"
            :text="petStore.loading ? 'Criando...' : 'Criar'"
            mode="outline"
            type="submit"
          />
        </div>
      </form>
    </div>
  </div>
</template>
