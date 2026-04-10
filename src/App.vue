<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/layouts/AppHeader.vue'
import AltHeader from './components/layouts/AltHeader.vue'
import MobileNavBar from './components/layouts/MobileNavBar.vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

const route = useRoute()

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<template>
  <header v-if="route.path === '/'">
    <AppHeader />
  </header>
  <header v-else>
    <AltHeader />
  </header>
  <main class="pb-20">
    <RouterView />
  </main>
  <MobileNavBar />
</template>
