import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppBottomNav from '../AppBottomNav.vue'
import { useAuthStore } from '@/stores/auth'
import { NAV_ITEMS } from '@/router/navigation'

const Stub = { template: '<div />' }

async function mountAt(mode, path = '/') {
  const pinia = createPinia()
  setActivePinia(pinia)
  const auth = useAuthStore()
  auth.user =
    mode === 'client'
      ? { client_profile: { id: 1 }, provider_profile: null }
      : { client_profile: null, provider_profile: { id: 1 } }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...new Set(NAV_ITEMS.map((i) => i.name)),
    ].map((name) => ({ name, path: name === 'home-view' ? '/' : `/${name}`, component: Stub })),
  })
  router.push(path)
  await router.isReady()
  return mount(AppBottomNav, { global: { plugins: [pinia, router] } })
}

describe('AppBottomNav', () => {
  beforeEach(() => localStorage.clear())

  it('client: 5 items with labels', async () => {
    const w = await mountAt('client')
    const labels = w.findAll('a').map((a) => a.text())
    expect(labels).toEqual(['Início', 'Buscar', 'Passeios', 'Pets', 'Perfil'])
  })

  it('provider: 4 items with labels', async () => {
    const w = await mountAt('provider', '/provider-today-view')
    const labels = w.findAll('a').map((a) => a.text())
    expect(labels).toEqual(['Hoje', 'Pedidos', 'Agenda', 'Perfil'])
  })

  it('active item has aria-current=page', async () => {
    const w = await mountAt('client', '/pets-view')
    const current = w.findAll('a[aria-current="page"]')
    expect(current).toHaveLength(1)
    expect(current[0].text()).toBe('Pets')
  })
})
