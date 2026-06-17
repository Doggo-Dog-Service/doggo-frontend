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
  <div class="flex flex-col sm:flex-row justify-between gap-4">
    <div class="flex gap-5">
      <img
        v-if="provider.user?.profile_picture"
        class="w-22 h-22 object-cover rounded-2xl shrink-0"
        :src="provider.user?.profile_picture?.file"
        alt="profile-photo"
      />
      <div
        v-else
        class="flex items-center justify-center h-22 w-22 rounded-2xl bg-linear-to-r from-doggo-green to-doggo-light-green border-white border-2 shrink-0"
      >
        <p class="text-white text-2xl">
          {{ provider.user?.full_name?.charAt(0) }}
        </p>
      </div>
      <div class="min-w-0">
        <h1 class="text-lg sm:text-xl font-semibold break-words">
          {{ provider.user?.full_name }}
        </h1>
        <div class="flex items-center gap-1 text-gray-400">
          <span class="mdi mdi-map-marker"></span>
          <p class="truncate">
            {{ provider.fixed_latitude }}
          </p>
        </div>
      </div>
    </div>
    <button
      v-if="authStore.user?.id === provider.user?.id"
      class="self-start sm:self-center border rounded-full px-4 py-2 font-bold text-doggo-green bg-green-100 whitespace-nowrap"
    >
      Editar
    </button>
  </div>
</template>
