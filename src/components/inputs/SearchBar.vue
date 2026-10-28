<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Search } from 'lucide-vue-next'

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
  if (!wrapper.value?.contains(e.target)) {
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
      class="w-full min-h-11 rounded-control border border-line bg-surface py-3 pl-4 pr-12 text-body text-fg placeholder:text-fg-subtle transition-colors duration-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      type="text"
      :aria-label="props.placeholder"
      :placeholder="props.placeholder"
      v-model="model"
      @change="emits('onChange')"
      @focus="emits('focus')"
    />
    <Search
      :size="20"
      :stroke-width="2"
      class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-fg-subtle"
      aria-hidden="true"
    />
    <slot name="list"></slot>
  </div>
</template>
