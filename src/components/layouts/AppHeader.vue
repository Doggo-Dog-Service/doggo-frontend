<script setup>
import { onMounted } from 'vue'
import { useLocation } from '@/composables/useLocation'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()

const {
  cityName,
  stateAbbr,
  loading,
  error,
  getLocation
} = useLocation()

onMounted(async () => {
  await getLocation()
})
</script>

<template>
  <div class="flex justify-between items-center p-4 md:p-6">
    <div class="flex items-center">
      <RouterLink to="/">
        <img class="w-25 mr-3" src="/logo.png" alt="" />
      </RouterLink>
      <div class="flex items-center" v-if="loading">
        <span class="text-doggo-green">
          <i class="mdi mdi-map-marker"></i>
        </span>
        <h1 class="text-doggo-black font-semibold text-sm">Obtendo localização...</h1>
      </div>
      <div v-else-if="error">
        <h1 class="text-doggo-black font-semibold text-sm">{{ error }}</h1>
      </div>
      <div v-else-if="cityName" class="flex gap-1 items-center">
        <span class="text-doggo-green">
          <span class="mdi mdi-map-marker"></span>
        </span>
        <h1 class="text-doggo-black font-semibold text-sm">{{ cityName }}</h1>
        <h1 class="text-gray-400 text-sm">,</h1>
        <h1 class="text-gray-400 text-sm">{{ stateAbbr }}</h1>
      </div>
    </div>

    <div class="flex gap-2">
      <button @click="authStore.logout()" class="cursor-pointer">
        <div class="text-2xl border border-doggo-gray text-red-400 rounded-xl px-1.5 pb-0.5">
          <span class="mdi mdi-exit-to-app"></span>
        </div>
      </button>
      <RouterLink to="/notifications">
        <div class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 pb-0.5">
          <span class="mdi mdi-bell-outline"></span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
