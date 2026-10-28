<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/shell/AppSidebar.vue'
import AppTopBar from '@/components/shell/AppTopBar.vue'
import AppBottomNav from '@/components/shell/AppBottomNav.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'

const route = useRoute()
const authStore = useAuthStore()
const serviceStore = useServiceStore()

const showNav = computed(() => !route.meta.hideNav)

// Contador de pedidos pendentes: carrega ao entrar no modo passeador e a cada troca de rota.
watch(
  () => [authStore.mode, route.fullPath],
  () => {
    if (authStore.mode === 'provider') serviceStore.fetchPendingCount()
  },
  { immediate: true },
)
</script>

<template>
  <div class="min-h-dvh bg-canvas text-fg">
    <AppSidebar />
    <div class="md:pl-68">
      <AppTopBar />
      <main
        :class="[
          'mx-auto w-full max-w-5xl px-4 py-5 md:px-8 md:py-8',
          showNav && 'pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-8',
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
    <AppBottomNav v-if="showNav" />
  </div>
</template>
