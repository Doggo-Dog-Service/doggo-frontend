<script setup>
import AppHeader from '@/components/layouts/AppHeader.vue'
import AltHeader from '@/components/layouts/AltHeader.vue';
import MobileNavBar from '@/components/layouts/MobileNavBar.vue'
import SideBar from '@/components/layouts/SideBar.vue'
import { useRouter } from 'vue-router';
const router = useRouter()
</script>

<template>
  <div class="flex flex-col md:flex-row">
    <SideBar class="hidden md:block" />
    <div class="md:ml-72">
      <AppHeader v-if="router.currentRoute.value.name == 'home-view'" class="md:hidden" />
      <AltHeader v-else/>
      <main>
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-300 ease-out"
            leave-active-class="transition duration-200 ease-in"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <component :is="Component" :key="$route.fullPath" />
          </Transition>
        </RouterView>
      </main>
    </div>
    <MobileNavBar class="block md:hidden" />
  </div>
</template>
