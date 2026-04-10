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
})
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <label v-if="props.label" class="text-sm">{{ props.label }}</label>
    <div class="relative">
      <span
        v-if="icon"
        :class="icon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
      ></span>

      <input
        class="w-full text-base border-2 border-doggo-gray rounded-xl py-2 pr-4"
        :class="icon ? 'pl-10' : 'pl-4'"
        :type="props.type"
        :placeholder="props.placeholder"
        v-model="model"
      />
    </div>
  </div>
</template>
