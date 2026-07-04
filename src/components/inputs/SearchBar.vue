<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const model = defineModel()
const emits = defineEmits(['onChange', 'focus', 'out'])
const props = defineProps({
  placeholder: {
    type: String,
    required: true,
  },
})

const wrapper = ref(null)

function handleClickOutside(e) {
  if(!wrapper.value?.contains(e.target)) {
    emits('out')
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative w-full" ref="wrapper">
    <input
      class="w-full border-2 bg-white border-doggo-gray px-4 py-3 rounded-2xl focus:outline-0 placeholder:text-doggo-black/30 focus:border-doggo-green transition-all duration-200"
      type="text"
      :placeholder="props.placeholder"
      v-model="model"
      @change="emits('onChange')"
      @focus="emits('focus')"
    />
    <span :class="['mdi mdi-magnify', 'absolute right-4 top-3 bottom-3 text-doggo-black/30 text-xl']"></span>
    <slot name="list"></slot>
  </div>
</template>
