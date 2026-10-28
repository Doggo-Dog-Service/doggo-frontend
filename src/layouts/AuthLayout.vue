<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Cadastro tem duas colunas; a localização precisa de espaço para o mapa.
const WIDTHS = {
  'register-view': 'max-w-3xl',
  'register-location-view': 'max-w-5xl',
}
const widthClass = computed(() => WIDTHS[route.name] ?? 'max-w-md')
const isMapPage = computed(() => route.name === 'register-location-view')
</script>

<template>
  <div class="min-h-dvh bg-canvas text-fg">
    <div :class="['mx-auto flex w-full flex-col gap-6 px-4 py-8 md:py-12', widthClass]">
      <RouterLink to="/" class="self-center rounded-control focus-visible:ring-2 focus-visible:ring-primary">
        <img class="h-10 w-auto" src="/logo.png" alt="Doggo" />
      </RouterLink>
      <main
        :class="[
          'overflow-hidden rounded-card border border-line bg-surface shadow-card',
          !isMapPage && 'p-6 md:p-8',
        ]"
      >
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
            leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
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
  </div>
</template>
