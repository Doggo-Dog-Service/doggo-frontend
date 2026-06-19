<script setup>
import {useRouter} from 'vue-router';
import {useRoute} from 'vue-router'

const router = useRouter();
const route = useRoute();
</script>
<template>
  <div class="flex justify-between  p-4">
    <button class="text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 cursor-pointer" @click="router.back()">
      <span class="mdi mdi-arrow-left"></span>
    </button>
    <RouterLink to="/">
        <img class="w-25 mr-3" src="/logo.png" alt="Doggo">
    </RouterLink>
    <RouterLink to="/notifications">
      <div :class="[
        route.path === '/notificações'
        ? 'text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 pb-0.5'
        : 'text-2xl border border-doggo-gray text-doggo-green rounded-xl px-1.5 pb-0.5 invisible'
        ]">
        <span class="mdi mdi-bell-outline"></span>
      </div>
    </RouterLink>
  </div>
</template>
