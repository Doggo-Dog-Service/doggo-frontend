<script setup>
const model = defineModel()
const props = defineProps({
  label: String,
  type: {
    type: String,
    default: 'text',
  },
  placeholder: String,
  icon: String,
  required: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <label v-if="props.label" class="flex text-sm font-semibold gap-2">
      <p>{{ props.label }}</p>
      <span v-if="props.required" class="text-red-400">*</span>
    </label>
    <div class="relative">
      <span
        v-if="icon"
        :class="icon"
        class="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
      ></span>

      <input
        class="w-full text-base border-2 border-doggo-gray rounded-xl py-3 pr-6 focus:outline-none focus:border-doggo-green transition-all duration-200"
        :class="icon ? 'pl-14' : 'pl-4'"
        :type="props.type"
        :placeholder="props.placeholder"
        :required="props.required"
        :step="props.type === 'number' ? '0.01' : ''"
        v-model="model"
      />
    </div>
  </div>
</template>
