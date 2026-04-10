<script setup>
import { onMounted } from 'vue';
import AppHeader from './components/layouts/AppHeader.vue';
import AltHeader from './components/layouts/AltHeader.vue';
import MobileNavBar from './components/layouts/MobileNavBar.vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from './stores/auth';
const authStore = useAuthStore();

const route = useRoute();
 
onMounted(async() => {
  await authStore.fetchUser();
});
</script>

<template>
  <header v-if="route.path === '/'">
    <AppHeader/>
  </header>
  <header v-else>
    <AltHeader/>
  </header>
  <div class="pb-20">
    <RouterView v-slot="{ Component }" class="p-4">
      <Transition name="fade" mode="out-in">
        <component :is="Component"/>
      </Transition>
    </RouterView>
  </div>
  <MobileNavBar/>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 300ms ease, transform 300ms ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to{
  opacity: 0;
  transform: translateY(10px);
}
</style>
