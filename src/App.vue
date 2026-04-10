<script setup>
import { computed, onMounted } from 'vue'
import AppHeader from './components/layouts/AppHeader.vue'
import AltHeader from './components/layouts/AltHeader.vue'
import MobileNavBar from './components/layouts/MobileNavBar.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

const route = useRoute()

const isAppHeader = computed(() => {
  if (route.path === '/') return true

  return false
})

const isLoginRoute = computed(() => {
  if (route.path === '/login') return true

  return false
})

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<template>
  <header>
    <AppHeader v-if="isAppHeader && !isLoginRoute" />
    <AltHeader v-if="!isAppHeader && !isLoginRoute" />
  </header>
  <main class="">
    <RouterView class="p-4"/>
  </main>
  <MobileNavBar />
</template>