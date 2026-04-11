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

const isLoginView = computed(() => {
  if (route.path === '/login') return true
  return false
})

const isRegisterView = computed(() => {
  if (route.path === '/register') return true
  return false
})

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<template>
  <header>
    <AppHeader v-if="isAppHeader && !isLoginView" />
    <AltHeader v-if="!isAppHeader && !isLoginView" />
  </header>
  <main>
    <RouterView/>
  </main>
  <MobileNavBar v-if="!isLoginView && !isRegisterView" />
</template>
