<script setup>
import { useAuthStore } from '@/stores/auth'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NavButton from '../buttons/NavButton.vue'
import { ArrowLeftEndOnRectangleIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import LogOutButton from '../buttons/LogOutButton.vue'
const authStore = useAuthStore()
const router = useRouter()

const routes = ref([])
const userConfigRouter = '/user/configs'

const isRouteActive = (path) => router.currentRoute.value.path === path

onMounted(() => {
  routes.value = router.getRoutes().filter((route) => route.meta.isView)
})
</script>

<template>
  <aside class="fixed top-0 left-0 w-72 h-screen flex flex-col bg-white">
    <div>
      <RouterLink class="w-full flex flex-col items-center py-6" to="/">
        <img class="w-25" src="/logo.png" alt="logo" />
      </RouterLink>
      <nav class="flex flex-col gap-1 w-full px-6 py-4">
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
    <div class="mt-auto flex flex-col px-6 gap-1">
      <NavButton :to="userConfigRouter" :icon="Cog6ToothIcon" text="Configurações" :active="isRouteActive(userConfigRouter)"/>
      <LogOutButton :icon="ArrowLeftEndOnRectangleIcon" text="Sair" @logout="authStore.logout"/>
    </div>
  </aside>
</template>
