<script setup>
import AltHeader from '@/components/layouts/AltHeader.vue';
import { useRoute } from 'vue-router';
const route = useRoute()
</script>
<template>
  <div>
    <AltHeader  v-if="route.name === 'register-view'"/>
    <main>
      <RouterView />
    </main>
  </div>
</template>
