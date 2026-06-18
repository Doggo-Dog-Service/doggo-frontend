<script setup>
import { useProvider } from '@/composables/useProvider'

const {
  experienceTime,
  experienceLabel
} = useProvider()
</script>

<template>
  <div class="bg-background-light border border-doggo-gray rounded-2xl py-5 flex items-center w-full">
    <div class="flex-1 flex flex-col items-center gap-1 border-r border-doggo-gray px-2">
      <p class="text-xl sm:text-2xl font-bold text-doggo-green">
        5,0
      </p>
      <p class="text-xs sm:text-sm text-gray-400">
        Nota
      </p>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1 border-r border-doggo-gray px-2">
      <p class="text-xl sm:text-2xl font-bold text-gray-800">
        128
      </p>
      <p class="text-xs sm:text-sm text-gray-400">
        Avaliações
      </p>
    </div>
    <div class="flex-1 flex flex-col items-center gap-1 px-2">
      <p class="text-xl sm:text-2xl font-bold text-gray-800 text-center">
        {{ experienceTime }} {{ experienceLabel }}
      </p>
      <p class="text-xs sm:text-sm text-gray-400">
        Experiência
      </p>
    </div>
  </div>
</template>
