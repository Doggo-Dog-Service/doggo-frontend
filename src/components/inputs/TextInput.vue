<script setup>
const model = defineModel()
const props = defineProps({
  placeholder: {
    type: String,
    required: false,
  },
  label: {
    type: String,
    required: false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <label v-if="props.label" class="flex text-sm font-semibold gap-2">
      <p>{{ props.label }}</p>
      <span v-if="props.required" class="text-red-400">*</span>
    </label>
    <textarea
      class="w-full min-h-35 max-h-35 text-base border-2 border-doggo-gray rounded-xl py-3 px-4 focus:outline-none focus:border-doggo-green transition-all duration-200"
      v-model="model"
      :placeholder="props.placeholder"
    ></textarea>
  </div>
</template>
