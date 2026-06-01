<script setup>
import { useProvider } from '@/composables/useProvider'

const {
  experienceTime,
  experienceLabel
} = useProvider()
</script>

<template>
  <div class="bg-background-light border border-doggo-gray rounded-2xl py-5 mx-2 flex items-center">
    <div class="flex-1 flex flex-col items-center gap-1 border-r border-doggo-gray">
      <p class="text-2xl font-bold text-doggo-green">5,0</p>
      <p class="text-sm text-gray-400">Nota</p>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1 border-r border-doggo-gray">
      <p class="text-2xl font-bold text-gray-800">128</p>
      <p class="text-sm text-gray-400">Avaliações</p>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1">
      <p class="text-2xl font-bold text-gray-800">
        {{ experienceTime }} {{ experienceLabel }}
      </p>
      <p class="text-sm text-gray-400">
        Experiência
      </p>
    </div>
  </div>
</template>
