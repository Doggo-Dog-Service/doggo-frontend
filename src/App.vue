<script setup>
import { useRoute } from 'vue-router';
import AltHeader from './components/layouts/AltHeader.vue';
import AppHeader from './components/layouts/AppHeader.vue';
import MobileNavBar from './components/layouts/MobileNavBar.vue';

const route = useRoute();
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
