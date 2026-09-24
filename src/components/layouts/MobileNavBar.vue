<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import NavButton from '../buttons/NavButton.vue'

const router = useRouter()
const authStore = useAuthStore()

const routes = router.getRoutes().filter((route) => {
  if (!route.meta.isView) return false

  if (route.meta.requiresClient && !authStore.isClient) return false

  return true
})

const isRouteActive = (path) => router.currentRoute.value.path === path
</script>
<template>
  <div class="fixed w-screen bottom-0 left-0 right-0 bg-background-light border-t border-doggo-gray z-50">
    <nav class="grid grid-cols-4 w-full justify-center items-center px-4 py-3">
      <NavButton
        v-for="(route, index) in routes"
        :key="index"
        :to="route.path"
        :type="route.meta.icon.type"
        :icon="route.meta.icon.value"
        :text="route.meta.title"
        :active="isRouteActive(route.path)"
      />
    </nav>
  </div>
</template>
