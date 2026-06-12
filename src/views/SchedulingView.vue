<script setup>
import AppInput from '@/components/inputs/AppInput.vue';
import { useServiceStore } from '@/stores/service'
const serviceStore = useServiceStore()
</script>

<template>
  <div class="p-6">
    <p class="text-2xl font-semibold w-full text-center">Scheduling View</p>
  </div>
</template>
