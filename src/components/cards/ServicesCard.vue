<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '/',
  },
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'green'].includes(value),
  },
})
</script>

<template>
  <RouterLink
    :to="props.link"
    :class="[
      'flex flex-col gap-2 p-3 border rounded-xl transition-all duration-200 ease-in-out active:scale-98 active:opacity-70 hover:scale-99',
      props.type === 'default' && 'border-doggo-gray bg-white',
      props.type === 'green' && 'border-doggo-light-green bg-green-50 text-doggo-green'
    ]"
  >
    <div class="flex items-center gap-4">
      <span
        v-if="props.icon"
        :class="[
          'flex flex-col items-center justify-center w-10 h-10 rounded-xl',
          props.type === 'default' && 'bg-doggo-gray',
          props.type === 'green' && 'bg-doggo-light-green'
        ]"
      >
        <span :class="props.icon" class="text-xl"></span>
      </span>
      <h2 :class="['font-semibold']">{{ props.title }}</h2>
    </div>
    <p :class="['text-sm', props.type === 'default' && 'text-doggo-black/50']">
      {{ props.description }}
    </p>
  </RouterLink>
</template>
