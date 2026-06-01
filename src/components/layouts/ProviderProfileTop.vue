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
  <div class="flex gap-5">
    <img
      class="w-22 h-22 object-cover rounded-2xl"
      v-if="provider.user?.profile_picture"
      :src="provider.user?.profile_picture?.file"
      alt="profile-photo"
    />
    <div
      v-else
      class="flex flex-col items-center justify-center h-22 w-22 rounded-2xl bg-linear-to-r from-doggo-green to-doggo-light-green z-1 border-white border-2"
    >
      <p class="text-white text-2xl">{{ provider.user?.full_name?.charAt(0) }}</p>
    </div>
    <div>
      <h1 class="text-xl font-semibold">{{ provider.user?.full_name }}</h1>
      <div class="flex text-gray-400">
        <span class="mdi mdi-map-marker"></span>
        <p>{{ provider.fixed_latitude }}</p>
      </div>
      <div class="w-full flex flex-col items-end">
        <button
          class="border rounded-4xl px-3 py-1 font-bold text-doggo-green bg-green-100"
          v-if="authStore.user?.id === props.provider?.user?.id"
        >
          Editar
        </button>
      </div>
    </div>
  </div>
</template>
