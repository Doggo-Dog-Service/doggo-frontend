import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
vi.mock('@/components/shell/AppSidebar.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/shell/AppTopBar.vue', () => ({ default: { template: '<div />' } }))
vi.mock('@/components/shell/AppBottomNav.vue', () => ({ default: { template: '<div />' } }))

import DefaultLayout from '../DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'

describe('DefaultLayout route key', () => {
  it('keeps the view mounted when only the query changes (wizard steps)', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAuthStore().user = { client_profile: { id: 1 }, provider_profile: null }
    const mounted = vi.fn()
    const View = { template: '<div />', mounted }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/scheduling/:providerId', name: 'scheduling-view', component: View },
        { path: '/other', name: 'other', component: View },
      ],
    })
    router.push('/scheduling/7?etapa=1')
    await router.isReady()
    mount(DefaultLayout, { global: { plugins: [pinia, router] } })
    await flushPromises()
    expect(mounted).toHaveBeenCalledTimes(1)

    await router.push('/scheduling/7?etapa=2')
    await flushPromises()
    expect(mounted).toHaveBeenCalledTimes(1)

    await router.push('/scheduling/8?etapa=1')
    await flushPromises()
    expect(mounted).toHaveBeenCalledTimes(2)
  })
})
