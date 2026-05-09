<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavButton from '../buttons/NavButton.vue'
const authStore = useAuthStore()
const router = useRouter()

const routes = ref([])

onMounted(() => {
  routes.value = router.getRoutes().filter((route) => route.meta.isView)
})
</script>

<template>
  <aside class="fixed left-0 w-72 h-screen flex flex-col bg-white">
    <RouterLink class="w-full flex flex-col items-center py-6" to="/">
      <img class="w-25" src="/logo.png" alt="logo" />
    </RouterLink>
    <nav class="w-full px-6">
      <NavButton
        v-for="(route, index) in routes"
        :key="index"
        :icon="route.meta.icon"
        :text="route.meta.title"
      />
    </nav>
  </aside>
</template>
