<script setup>
import AppHeader from '@/components/layouts/AppHeader.vue'
import MobileNavBar from '@/components/layouts/MobileNavBar.vue'
import SideBar from '@/components/layouts/SideBar.vue';
</script>

<template>
  <div class="flex flex-col md:flex-row">
    <SideBar class="hidden md:block"/>
    <div class="md:ml-72">
      <AppHeader class="md:hidden"/>
      <main>
        <RouterView />
      </main>
    </div>
    <MobileNavBar class="block md:hidden"/>
  </div>
</template>
