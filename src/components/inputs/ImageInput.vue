<script setup>
import { ref } from 'vue'
import { CameraIcon } from '@heroicons/vue/24/outline'

const model = defineModel()

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
})

const preview = ref(null)

function handleFileChange(event) {
  const file = event.target.files?.[0]

  if (!file) {
    preview.value = null
    model.value = null
    return
  }

  ;((model.value = file), (preview.value = URL.createObjectURL(file)))
}
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <input class="hidden" id="image" type="file" accept="image/*" @change="handleFileChange" />
    <label
      for="image"
      class="group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-4xl border-2 border-dashed transition-all duration-200 border-doggo-green bg-doggo-green/10  hover:border-green-900 hover:bg-doggo-green/20"
    >
      <img v-if="preview" :src="preview" alt="Foto de perfil" class="h-full w-full object-cover" />

      <template v-else>
        <div class="flex flex-col items-center gap-2 text-doggo-green">
          <CameraIcon class="h-8 w-8" />
          <span class="text-xs font-medium"> Adicionar foto </span>
        </div>
      </template>

      <div
        class="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex"
        v-if="preview"
      >
        <CameraIcon class="h-8 w-8" />
      </div>
    </label>

    <p v-if="label" class="text-sm font-semibold text-zinc-600">
      {{ props.label }}
    </p>
  </div>
</template>
