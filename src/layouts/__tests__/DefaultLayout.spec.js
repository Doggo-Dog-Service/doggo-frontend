import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
vi.mock('@/components/shell/AppSidebar.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/shell/AppTopBar.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/shell/AppBottomNav.vue', () => ({ default: { template: '<div />' } }))

import DefaultLayout from '../DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'

const Stub = { template: '<div />' }

async function setup() {
  const pinia = createPinia()
  setActivePinia(pinia)
  useAuthStore().user = { client_profile: null, provider_profile: { id: 1 } }
  const store = useServiceStore()
  store.fetchPendingCount = vi.fn()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['provider-today-view', 'provider-requests-view', 'agenda-view'].map((name) => ({
      name,
      path: `/${name}`,
      component: Stub,
    })),
  })
  router.push('/provider-today-view')
  await router.isReady()
  mount(DefaultLayout, {
    global: {
      plugins: [pinia, router],
    },
  })
  return { store, router }
}

describe('DefaultLayout pending count', () => {
  it('fetches once on provider mode and not on other navigation', async () => {
    const { store, router } = await setup()
    expect(store.fetchPendingCount).toHaveBeenCalledTimes(1)
    await router.push('/agenda-view')
    await router.push('/provider-today-view')
    await flushPromises()
    expect(store.fetchPendingCount).toHaveBeenCalledTimes(1)
  })

  it('refetches when entering requests view', async () => {
    const { store, router } = await setup()
    await router.push('/provider-requests-view')
    await flushPromises()
    expect(store.fetchPendingCount).toHaveBeenCalledTimes(2)
  })
})
