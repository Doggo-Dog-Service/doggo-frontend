<script setup>
import { ref } from 'vue'
import { Camera } from 'lucide-vue-next'

const model = defineModel()

const props = defineProps({
  label: {
    type: String,
    required: false,
  },
  edit: {
    type: Boolean,
    default: false,
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
    <input class="sr-only" id="image" type="file" accept="image/*" @change="handleFileChange" />
    <label
      for="image"
      class="group relative flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-card border-2 border-dashed border-primary bg-primary-soft transition-colors duration-200 hover:bg-surface-muted has-focus-visible:ring-2 has-focus-visible:ring-primary has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-canvas"
    >
      <img v-if="preview" :src="preview" alt="Foto selecionada" class="size-full object-cover" />

      <div v-else class="flex flex-col items-center gap-2 text-primary">
        <Camera :size="32" :stroke-width="2" aria-hidden="true" />
        <span class="text-caption font-semibold">{{ props.edit ? 'Alterar foto' : 'Adicionar foto' }}</span>
      </div>

      <div
        v-if="preview"
        class="absolute inset-0 hidden items-center justify-center bg-neutral-950/40 text-white group-hover:flex"
      >
        <Camera :size="32" :stroke-width="2" aria-hidden="true" />
      </div>
    </label>

    <p v-if="label" class="text-caption font-semibold text-fg-muted">
      {{ props.label }}
    </p>
  </div>
</template>
