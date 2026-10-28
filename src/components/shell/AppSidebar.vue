<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import ModeSwitch from './ModeSwitch.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'
import { navItemsFor, activeTabName, homeRouteFor } from '@/router/navigation'
import { useTheme } from '@/composables/useTheme.js'

const { isLight } = useTheme()

const route = useRoute()
const authStore = useAuthStore()
const serviceStore = useServiceStore()


const items = computed(() => navItemsFor(authStore.mode))
const activeName = computed(() => activeTabName(route, authStore.mode))
</script>

<template>
  <aside class="fixed inset-y-0 left-0 z-30 hidden w-68 flex-col gap-6 border-r border-line bg-surface p-5 md:flex">
    <RouterLink
      :to="homeRouteFor(authStore.mode)"
      class="rounded-control px-2 pt-1 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <img class="h-9 w-auto" :src="isLight ? '/logo.png' : '/logo-dark-mode.png'" alt="Doggo" />
    </RouterLink>

    <ModeSwitch />

    <nav aria-label="Navegação principal" class="flex-1">
      <ul class="flex flex-col gap-1">
        <li v-for="item in items" :key="item.name">
          <RouterLink
            :to="item.to"
            :aria-current="activeName === item.name ? 'page' : undefined"
            :class="[
              'flex min-h-11 items-center gap-3 rounded-control px-3 text-body font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-primary',
              activeName === item.name
                ? 'bg-primary-soft text-primary'
                : 'text-fg-muted hover:bg-surface-muted hover:text-fg',
            ]"
          >
            <component :is="item.icon" :size="20" :stroke-width="2" aria-hidden="true" />
            <span class="flex-1">{{ item.label }}</span>
            <span
              v-if="item.name === 'provider-requests-view' && serviceStore.pendingCount > 0"
              class="min-w-5 rounded-full bg-danger px-1.5 text-center text-caption font-bold text-primary-fg"
            >
              {{ serviceStore.pendingCount }}<span class="sr-only"> pedidos pendentes</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <RouterLink
      :to="{ name: 'profile-view' }"
      class="flex items-center gap-3 rounded-control border-t border-line px-2 pt-4 focus-visible:ring-2 focus-visible:ring-primary"
    >
      <UiAvatar :src="authStore.user?.profile_picture?.file" :name="authStore.user?.full_name" />
      <span class="min-w-0">
        <span class="block truncate text-body font-semibold text-fg">{{ authStore.user?.full_name }}</span>
        <span class="block text-caption text-fg-muted">
          {{ authStore.mode === 'provider' ? 'Passeador' : 'Tutor' }}
        </span>
      </span>
    </RouterLink>
  </aside>
</template>
