<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'
import { navItemsFor, activeTabName } from '@/router/navigation'

const route = useRoute()
const authStore = useAuthStore()
const serviceStore = useServiceStore()

const items = computed(() => navItemsFor(authStore.mode))
const activeName = computed(() => activeTabName(route, authStore.mode))
</script>

<template>
  <nav
    aria-label="Navegação principal"
    class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
  >
    <ul class="mx-auto flex max-w-lg">
      <li v-for="item in items" :key="item.name" class="flex-1">
        <RouterLink
          :to="item.to"
          :aria-current="activeName === item.name ? 'page' : undefined"
          :class="[
            'relative flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-caption font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
            activeName === item.name ? 'text-primary' : 'text-fg-muted hover:text-fg',
          ]"
        >
          <span
            v-if="activeName === item.name"
            class="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
            aria-hidden="true"
          ></span>
          <span class="relative">
            <component :is="item.icon" :size="22" :stroke-width="2" aria-hidden="true" />
            <span
              v-if="item.name === 'provider-requests-view' && serviceStore.pendingCount > 0"
              class="absolute -right-2.5 -top-1.5 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] font-bold leading-4 text-primary-fg"
            >
              {{ serviceStore.pendingCount }}<span class="sr-only"> pedidos pendentes</span>
            </span>
          </span>
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
