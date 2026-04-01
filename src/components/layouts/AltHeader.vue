<script setup>
import {useRouter} from 'vue-router';
const router = useRouter();
const route = useRouter();
</script>
<template>
  <div class="flex justify-around">
    <button class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5" @click="router.back()">
      <span class="mdi mdi-arrow-left"></span>
    </button>
    <RouterLink to="/">
        <img class="w-25 mr-3" src="/logo.png" alt="">
    </RouterLink>
    <RouterLink v-if="route.value === '/notifications'" to="/notifications">
      <div class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 pb-0.5">
        <span class="mdi mdi-bell-outline"></span>
      </div>
    </RouterLink>
  </div>
</template>
