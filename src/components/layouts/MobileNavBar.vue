<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const routes = router.getRoutes().filter((r) => r.meta.isView === true)

function isRouteActive(path) {
  return router.currentRoute.value.path === path
}
</script>
<template>
  <div class="bg-background-light border-t border-doggo-gray">
    <nav>
      <RouterLink :class="[
        'flex justify-around my-2 text-doggo-gray active:text-doggo-green',
        isRouteActive(route.path) && 'text-doggo-green'
      ]" v-for="(route, index) in routes" :key="index" :to="route.path">
        <div>
          <span :class="[
            route.meta.icon,
            'text-4xl px-1.5 py-0.5 active:bg-doggo-gray active:rounded-xl',
            isRouteActive(route.path) && 'bg-doggo-gray rounded-xl'
            ]"></span>
          <p>{{ route.meta.title }}</p>
        </div>
      </RouterLink>
    </nav>
  </div>
</template>
