<script setup>
import AppHeader from '@/components/layouts/AppHeader.vue'
import MobileNavBar from '@/components/layouts/MobileNavBar.vue'
</script>

<template>
  <div>
    <AppHeader />
    <main>
      <RouterView />
    </main>
    <MobileNavBar />
  </div>
</template>
