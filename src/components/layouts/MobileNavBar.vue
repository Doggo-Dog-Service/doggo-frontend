<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const routes = router.getRoutes().filter((r) => r.meta.isView === true)

function isRouteActive(path) {
  return router.currentRoute.value.path === path
}
</script>
<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background-light border-t border-doggo-gray">
    <nav class="flex justify-around">
      <RouterLink :class="[
        'flex flex-col items-center justify-center my-2',
        isRouteActive(route.path) ? 'text-doggo-green' : 'text-gray-400'
      ]" v-for="(route, index) in routes" :key="index" :to="route.path">
        <span :class="[
          route.meta.icon,
          'text-2xl px-1.5 py-0.5 active:bg-doggo-gray active:rounded-xl',
          isRouteActive(route.path) && 'bg-doggo-gray rounded-xl'
        ]"></span>
        <p class="text-xs">{{ route.meta.title }}</p>
      </RouterLink>
    </nav>
  </div>
</template>
