<script setup>
const model = defineModel()
const emits = defineEmits(['onChange'])
const props = defineProps({
  placeholder: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <div class="relative w-full">
    <input
      class="w-full border-2 bg-white border-doggo-gray px-4 py-3 rounded-2xl focus:outline-0 placeholder:text-doggo-black/30 focus:border-doggo-green focus:bg-doggo-green/5 transition-all duration-200"
      type="text"
      :placeholder="props.placeholder"
      v-model="model"
      @change="emits('onChange')"
    />
    <span :class="['mdi mdi-magnify', 'absolute right-4 top-3 bottom-3 text-doggo-black/30 text-xl']"></span>
  </div>
</template>
