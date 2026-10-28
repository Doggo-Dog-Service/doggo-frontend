<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { homeRouteFor, isTabRoute } from '@/router/navigation'
import { useTheme } from '@/composables/useTheme.js'

const { preference } = useTheme()
const isLight = computed(() => preference === 'light')

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isTab = computed(() => isTabRoute(route, authStore.mode))

function goBack() {
  if (window.history.state?.back) router.back()
  else router.push(homeRouteFor(authStore.mode))
}
</script>

<template>
  <header
    :class="[
      'sticky top-0 z-20 flex min-h-14 items-center gap-3 border-b border-line bg-surface px-4 pt-[env(safe-area-inset-top)] md:static md:border-0 md:bg-transparent md:px-8 md:pt-6',
      isTab && 'md:hidden',
    ]"
  >
    <button
      v-if="!isTab"
      type="button"
      aria-label="Voltar"
      class="-ml-2 flex size-11 cursor-pointer items-center justify-center rounded-full text-fg transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary"
      @click="goBack"
    >
      <ArrowLeft :size="22" :stroke-width="2" aria-hidden="true" />
    </button>
    <RouterLink
      v-else
      :to="homeRouteFor(authStore.mode)"
      class="shrink-0 rounded-control focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img class="h-7 w-auto" :src="isLight ? '/logo.png' : '/logo-dark-mode.png'" alt="Doggo" />
    </RouterLink>
    <h1 class="flex-1 truncate text-subtitle text-fg">{{ route.meta.title }}</h1>
    <slot name="actions" />
  </header>
</template>
