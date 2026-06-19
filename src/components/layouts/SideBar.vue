<script setup>
import NavButton from '../buttons/NavButton.vue'
import LogOutButton from '../buttons/LogOutButton.vue'
import { onMounted, ref } from 'vue'
import { ArrowLeftEndOnRectangleIcon, BellIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()

const routes = ref([])

const isRouteActive = (path) => router.currentRoute.value.path === path

onMounted(() => {
  routes.value = router.getRoutes().filter((route) => route.meta.isView)
})
</script>

<template>
  <aside class="bg-white h-screen fixed w-72 p-6">
    <nav class="flex flex-col justify-between h-full">
      <ul class="grid gap-1">
        <li class="mb-3 flex flex-col">
          <RouterLink to="/">
            <img class="w-25" src="/logo.png" alt="logo" />
          </RouterLink>
        </li>
        <li v-for="(route, index) in routes" :key="index">
          <NavButton
            :to="route.path"
            :icon="route.meta.icon"
            :text="route.meta.title"
            :active="isRouteActive(route.path)"
          />
        </li>
      </ul>

      <ul class="grid gap-5">
        <li class="grid gap-1 border-y border-doggo-gray py-5">
          <LogOutButton
            :icon="ArrowLeftEndOnRectangleIcon"
            text="Sair"
            @logout="authStore.logout"
          />
        </li>
        <li class="grid grid-cols-4 items-center  gap-4 w-full">
          <img
            class="col-span-1 w-12 h-12 object-cover rounded-full"
            v-if="authStore.user?.profile_picture?.file"
            :src="authStore.user?.profile_picture?.file"
            alt="profile_picture"
          />
          <div
            v-else
            class="w-12 h-12 bg-doggo-light-green grid items-center justify-center rounded-full text-white"
          >
            {{ authStore.user?.full_name?.[0] }}
          </div>
          <div class="col-span-2">
            <h2 class="text-base truncate font-semibold">
              {{ authStore.user?.full_name }}
            </h2>
            <p class="text-sm font-medium text-gray-400">
              {{ authStore.user?.provider_profile ? authStore.user?.provider_profile?.service_type_detail?.name : 'Cliente' }}
            </p>
          </div>
          <RouterLink to="/" class="grid col-span-1 justify-center items-center p-2 w-fit h-fit rounded-xl transition-all duration-200 hover:bg-gray-400/20 ">
            <BellIcon class="w-5 h-5 text-gray-400" />
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
