<script setup>
import { useRouter } from 'vue-router'
import NavButton from '../buttons/NavButton.vue'
const router = useRouter()

const routes = router.getRoutes().filter((r) => r.meta.isView)

const isRouteActive = (path) => router.currentRoute.value.path === path
</script>
<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background-light border-t border-doggo-gray py-2">
    <nav class="flex justify-center gap-5">
      <NavButton
        v-for="(route, index) in routes"
        :key="index"
        :to="route.path"
        :icon="route.meta.icon"
        :text="route.meta.title"
        :active="isRouteActive(route.path)"
      />
    </nav>
  </div>
</template>
