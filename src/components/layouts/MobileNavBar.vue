<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import NavButton from '../buttons/NavButton.vue'
import { computed } from 'vue'

const router = useRouter()
const authStore = useAuthStore()

const routes = router.getRoutes().filter((route) => {
  if (!route.meta.isView) return false

  if (route.meta.requiresClient && !authStore.isClient) return false

  return true
})

const isRouteActive = (path) => router.currentRoute.value.path === path
const gridCols = computed(() => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
  }

  return cols[routes.length] || 'grid-cols-1'
})
</script>
<template>
  <div class="fixed w-screen bottom-0 left-0 right-0 bg-background-light border-t border-doggo-gray z-50">
    <nav :class="['grid gap-2  w-full justify-center items-center px-4 py-3', gridCols]">
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
