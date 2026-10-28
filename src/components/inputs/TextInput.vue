<script setup>
import { computed, useId } from 'vue'

const model = defineModel()
const props = defineProps({
  placeholder: {
    type: String,
    required: false,
  },
  label: {
    type: String,
    required: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  hint: String,
  error: String,
})

const uid = useId()
const inputId = `${uid}-input`
const hintId = `${uid}-hint`
const errorId = `${uid}-error`
const describedBy = computed(() => (props.error ? errorId : props.hint ? hintId : undefined))
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <label v-if="props.label" :for="inputId" class="flex text-caption font-semibold text-fg gap-2">
      <span>{{ props.label }}</span>
      <span v-if="props.required" class="text-danger" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="inputId"
      class="w-full min-h-35 max-h-35 text-body text-fg bg-surface placeholder:text-fg-subtle border rounded-control py-3 px-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
      :class="props.error ? 'border-danger' : 'border-line focus:border-primary'"
      v-model="model"
      :placeholder="props.placeholder"
      :required="props.required"
      :aria-invalid="props.error ? 'true' : undefined"
      :aria-describedby="describedBy"
    ></textarea>
    <p v-if="props.error" :id="errorId" class="text-caption text-danger">{{ props.error }}</p>
    <p v-else-if="props.hint" :id="hintId" class="text-caption text-fg-muted">{{ props.hint }}</p>
  </div>
</template>
