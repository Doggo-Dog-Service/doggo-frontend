<script setup>
import { usePresence } from './composables/usePresence'
usePresence()
</script>

<template>
  <div class="flex flex-col h-screen">
    <main class="flex-1 text-doggo-black">
      <RouterView v-slot="{ Component }">
        <Transition
          mode="out-in"
          enter-active-class="transition duration-300 ease-out"
          leave-active-class="transition duration-200 ease-in"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <component 
            :is="Component" 
            :key="$route.fullPath"
          />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
