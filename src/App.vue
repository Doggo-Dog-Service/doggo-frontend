<script setup>
import { computed, onMounted } from 'vue'
import AppHeader from './components/layouts/AppHeader.vue'
import AltHeader from './components/layouts/AltHeader.vue'
import MobileNavBar from './components/layouts/MobileNavBar.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const isAppHeader = computed(() => route.path === '/')
const isLoginView = computed(() => route.path === '/login')
const isRegisterView = computed(() => route.path === '/register' || route.path === '/register/location')

const isAuthPage = computed(() => isLoginView.value || isRegisterView.value)

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<template>
  <div class="flex flex-col h-screen">
    <header>
      <AppHeader v-if="isAppHeader && !isLoginView" />
      <AltHeader v-if="!isAppHeader && !isLoginView" />
    </header>
    <main class="flex-1 text-doggo-black">
      <RouterView />
    </main>
    <MobileNavBar v-if="!isAuthPage " />
  </div>
</template>
