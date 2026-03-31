<script setup>
import {useRouter} from 'vue-router';
const router = useRouter();
</script>
<template>
  <div class="flex justify-around">
    <button @click="router.back()">
      <span class="mdi mdi-arrow-left"></span>
    </button>
    <RouterLink to="/">
        <img class="w-25 mr-3" src="/logo.png" alt="">
    </RouterLink>
    <RouterLink to="/notifications">
      <div class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 pb-0.5">
        <span class="mdi mdi-bell-outline"></span>
      </div>
    </RouterLink>
  </div>
</template>
