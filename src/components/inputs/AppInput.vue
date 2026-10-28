<script setup>
import { computed, useId } from 'vue'
import UiIcon from '@/components/ui/UiIcon.vue'

const model = defineModel()
const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  autocomplete: String,
  icon: {
    type: [Object, Function],
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  hint: String,
  error: String,
  min: [String, Number],
  max: [String, Number],
  step: [String, Number],
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
    <div class="relative">
      <span
        v-if="props.icon"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle text-xl flex"
      >
        <UiIcon :icon="props.icon" />
      </span>

      <input
        :id="inputId"
        class="w-full min-h-11 text-body text-fg bg-surface placeholder:text-fg-subtle border rounded-control py-3 pr-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all duration-200"
        :class="[props.icon ? 'pl-12' : 'pl-4', props.error ? 'border-danger' : 'border-line focus:border-primary']"
        :type="props.type"
        :placeholder="props.placeholder"
        :autocomplete="props.autocomplete"
        :required="props.required"
        :min="props.min"
        :max="props.max"
        :step="props.step ?? (props.type === 'number' ? '0.01' : '')"
        :aria-invalid="props.error ? 'true' : undefined"
        :aria-describedby="describedBy"
        v-model="model"
      />
    </div>
    <p v-if="props.error" :id="errorId" class="text-caption text-danger">{{ props.error }}</p>
    <p v-else-if="props.hint" :id="hintId" class="text-caption text-fg-muted">{{ props.hint }}</p>
  </div>
</template>
