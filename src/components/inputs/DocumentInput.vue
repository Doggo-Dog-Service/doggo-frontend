<script setup>
import { computed, useId } from 'vue'
import { FileUp } from 'lucide-vue-next'

const model = defineModel()
defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: '' },
})

const uid = useId()
const fileName = computed(() => model.value?.name ?? '')

function onChange(event) {
  model.value = event.target.files?.[0] ?? null
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <input :id="uid" class="sr-only" type="file" accept="image/*,application/pdf" @change="onChange" />
    <label
      :for="uid"
      class="flex min-h-14 cursor-pointer items-center gap-3 rounded-control border-2 border-dashed border-primary bg-primary-soft px-4 py-3 text-primary transition-colors hover:bg-surface-muted has-focus-visible:ring-2 has-focus-visible:ring-primary has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-canvas"
    >
      <FileUp :size="24" :stroke-width="2" aria-hidden="true" class="shrink-0" />
      <span class="min-w-0 flex-1">
        <span class="block text-body font-semibold">{{ label }}</span>
        <span class="block truncate text-caption text-fg-muted">{{ fileName || hint || 'Imagem ou PDF' }}</span>
      </span>
    </label>
  </div>
</template>
