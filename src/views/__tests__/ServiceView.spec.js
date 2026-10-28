import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'

const serviceApi = vi.hoisted(() => ({
  getService: vi.fn(),
  getServiceRoute: vi.fn(async () => ({ points: [], distance_meters: 0 })),
}))
vi.mock('@/services/service', () => serviceApi)
vi.mock('@/composables/useServiceWebSocket', () => ({
  useServiceWebSocket: () => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    startTracking: vi.fn(),
    stopTracking: vi.fn(),
  }),
}))
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } }),
  useRouter: () => ({ push: vi.fn() }),
}))
vi.mock('@/utils/notify', () => ({ default: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import ServiceView from '../ServiceView.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

const base = {
  id: 1,
  status: 1,
  provider_id: 7,
  client_id: 3,
  start_datetime: '2026-10-28T10:00:00Z',
  end_datetime: '2026-10-28T11:00:00Z',
  price: '40.00',
  client_name: 'Ana',
  provider_name: 'Bob',
  service_type: 'Dog Walking',
  pets: [{ id: 1, name: 'Rex', breed: 'SRD' }],
  contact_phone: null,
}

const stubs = {
  ServiceActiveWalk: { template: '<div data-live />' },
  ServiceRouteMap: { template: '<div data-route />' },
  RouterLink: { template: '<a><slot /></a>' },
}

async function setup(role, service) {
  const auth = useAuthStore()
  auth.user =
    role === 'provider' ? { provider_profile: { id: 7 } } : { client_profile: { id: 3 } }
  serviceApi.getService.mockResolvedValue({ ...base, ...service })
  const wrapper = mount(ServiceView, { global: { stubs } })
  await flushPromises()
  return wrapper
}

const buttons = (w) => w.findAll('[data-actions] button').map((b) => b.text())

describe('ServiceView por status', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    serviceApi.getServiceRoute.mockResolvedValue({ points: [], distance_meters: 0 })
  })

  it('status 1 passeador: resumo + confirmar/recusar', async () => {
    const w = await setup('provider', { status: 1 })
    expect(w.find('[data-summary]').exists()).toBe(true)
    expect(w.text()).toContain('Ana')
    expect(buttons(w)).toEqual(expect.arrayContaining(['Confirmar', 'Recusar']))
  })

  it('status 1 tutor: só cancelar solicitação', async () => {
    const w = await setup('client', { status: 1 })
    expect(buttons(w)).toEqual(['Cancelar solicitação'])
  })

  it('status 2 passeador: iniciar/cancelar e WhatsApp com contact_phone', async () => {
    const w = await setup('provider', { status: 2, contact_phone: '(47) 99999-0001' })
    expect(buttons(w)).toEqual(expect.arrayContaining(['Iniciar passeio', 'Cancelar']))
    expect(w.find('a[href^="https://wa.me/"]').exists()).toBe(true)
  })

  it('status 2 tutor: cancelar; sem contact_phone sem WhatsApp', async () => {
    const w = await setup('client', { status: 2 })
    expect(buttons(w)).toEqual(['Cancelar'])
    expect(w.find('a[href^="https://wa.me/"]').exists()).toBe(false)
  })

  it('status 3: componente ao vivo', async () => {
    const w = await setup('client', { status: 3 })
    expect(w.find('[data-live]').exists()).toBe(true)
    expect(w.find('[data-summary]').exists()).toBe(false)
  })

  it('status 4: rota, sem resumo de pendente', async () => {
    const w = await setup('client', { status: 4 })
    expect(w.find('[data-route]').exists()).toBe(true)
    expect(w.find('[data-summary]').exists()).toBe(false)
  })

  it.each([5, 6])('status %i: card sem mapa e sem ações', async (status) => {
    const w = await setup('client', { status })
    expect(w.find('[data-summary]').exists()).toBe(true)
    expect(w.find('[data-route]').exists()).toBe(false)
    expect(w.find('[data-live]').exists()).toBe(false)
    expect(w.find('[data-actions]').exists()).toBe(false)
  })

  it('troca 2->3->4 pela store troca layout sem recarregar', async () => {
    const w = await setup('provider', { status: 2 })
    const store = useServiceWebSocketStore()
    const calls = serviceApi.getService.mock.calls.length
    expect(w.find('[data-summary]').exists()).toBe(true)
    store.setService({ ...base, status: 3 })
    await flushPromises()
    expect(w.find('[data-live]').exists()).toBe(true)
    store.setService({ ...base, status: 4 })
    await flushPromises()
    expect(w.find('[data-route]').exists()).toBe(true)
    expect(serviceApi.getService.mock.calls.length).toBe(calls)
  })

  it.each([1, 5, 6])('status %i com contact_phone: sem WhatsApp', async (status) => {
    const w = await setup('client', { status, contact_phone: '(47) 99999-0001' })
    expect(w.find('a[href^="https://wa.me/"]').exists()).toBe(false)
  })

  it('status 1 e 2: mostra duração prevista (end - start)', async () => {
    const w1 = await setup('client', { status: 1 })
    expect(w1.text()).toContain('1h')
    const w2 = await setup('client', {
      status: 2,
      end_datetime: '2026-10-28T11:30:00Z',
    })
    expect(w2.text()).toContain('1h30')
  })
})
