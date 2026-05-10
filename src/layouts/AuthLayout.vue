<script setup>
import AltHeader from '@/components/layouts/AltHeader.vue'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
<template>
  <div>
    <AltHeader v-if="route.name === 'register-view'" />
    <main>
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
          <component :is="Component" :key="$route.fullPath" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
