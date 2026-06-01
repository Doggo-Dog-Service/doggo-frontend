<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
})

onMounted(() => {
  console.log('Usuário logado:', authStore.user)
  console.log('Provider:', props.provider)
})
</script>
<template>
  <img
    v-if="props.provider?.user?.profile_picture"
    class="h-30 w-30 rounded-2xl z-1 border-white border-4 translate-x-3"
    :src="props.provider?.user?.profile_picture?.file"
    :alt="`${props.provider?.user?.full_name.toLowerCase()}-picture`"
  />
  <div
    v-else
    class="flex flex-col items-center justify-center h-22 w-22 rounded-2xl bg-linear-to-r from-doggo-green to-doggo-light-green z-1 border-white border-2 translate-x-3"
  >
    <p class="text-white text-xl">
      {{ props.provider?.user?.full_name?.charAt() }}
    </p>
  </div>
  <p class="text-black -translate-y-28 translate-x-5 ml-30 text-2xl font-bold">
    {{ props.provider?.user?.full_name }}
  </p>
  <div class="flex flex-nowrap w-1/3">
    <p class="whitespace-nowrap ml-51 -translate-26 -translate-x-16.5 text-gray-400">
      <span class="mdi mdi-map-marker"></span>
      {{ props.provider?.fixed_latitude }}
    </p>
    <button
      class="ml-8 -translate-24 border rounded-4xl px-3 py-1 font-bold text-doggo-green bg-green-100"
      v-if="authStore.user?.id === props.provider?.user?.id"
    >
      Editar
    </button>
  </div>
</template>
