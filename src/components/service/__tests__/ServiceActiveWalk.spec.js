import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

const wake = { supported: true, active: ref(false), request: vi.fn(), release: vi.fn() }
vi.mock('@/composables/useWakeLock', () => ({ useWakeLock: () => wake }))

const mapApi = {
  createMap: vi.fn(),
  addMarker: vi.fn(() => ({ setLngLat: vi.fn() })),
  flyTo: vi.fn(),
  setStyle: vi.fn(),
  loaded: ref(false),
}
vi.mock('@/composables/useMap', () => ({ useMap: () => mapApi }))
vi.mock('@/services/service', () => ({}))
vi.mock('@/utils/notify', () => ({ default: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import ServiceActiveWalk from '../ServiceActiveWalk.vue'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

function setup(role, service = {}) {
  const store = useServiceWebSocketStore()
  store.setService({
    id: 1,
    status: 3,
    start_datetime: new Date().toISOString(),
    client_name: 'Ana',
    provider_name: 'Bob',
    pets: [],
    contact_phone: '(47) 99999-0001',
    ...service,
  })
  return { store, wrapper: mount(ServiceActiveWalk, { props: { role }, attachTo: document.body }) }
}

describe('ServiceActiveWalk', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    sessionStorage.clear()
    mapApi.loaded.value = false
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('provider: banner, wake lock on mount and release on unmount', () => {
    const { wrapper } = setup('provider')
    expect(wrapper.text()).toContain('Mantenha o app aberto durante o passeio')
    expect(wake.request).toHaveBeenCalledTimes(1)
    wrapper.unmount()
    expect(wake.release).toHaveBeenCalled()
  })

  it('tutor: no banner, no wake lock, waits for first location', () => {
    const { wrapper } = setup('client')
    expect(wrapper.text()).not.toContain('Mantenha o app aberto')
    expect(wake.request).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Aguardando a primeira localização')
    expect(mapApi.addMarker).not.toHaveBeenCalled()
  })

  it('tutor: shows live signal after location arrives', async () => {
    const { store, wrapper } = setup('client')
    store.updateLocation({ latitude: -26.3, longitude: -48.8 }, 120)
    await flushPromises()
    expect(wrapper.text()).toContain('Ao vivo')
    expect(wrapper.text()).not.toContain('Aguardando a primeira localização')
    expect(mapApi.addMarker).toHaveBeenCalled()
  })

  it('whatsapp only with contact_phone', () => {
    expect(setup('client').wrapper.find('a[href^="https://wa.me/"]').exists()).toBe(true)
    setActivePinia(createPinia())
    const { wrapper } = setup('client', { contact_phone: null })
    expect(wrapper.find('a[href^="https://wa.me/"]').exists()).toBe(false)
  })

  it('economizar bateria toggles, persists and restyles map', async () => {
    mapApi.loaded.value = true
    const { wrapper } = setup('provider')
    const btn = wrapper.get('[data-dim-toggle]')
    expect(btn.attributes('aria-pressed')).toBe('false')
    expect(wrapper.find('[data-dim-overlay]').exists()).toBe(false)
    await btn.trigger('click')
    expect(btn.attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('[data-dim-overlay]').exists()).toBe(true)
    expect(sessionStorage.getItem('doggo-walk-dim')).toBe('1')
    expect(mapApi.setStyle).toHaveBeenCalledWith('dark')
    await btn.trigger('click')
    expect(sessionStorage.getItem('doggo-walk-dim')).toBe('0')
  })

  it('restores dim from sessionStorage', () => {
    sessionStorage.setItem('doggo-walk-dim', '1')
    const { wrapper } = setup('provider')
    expect(wrapper.find('[data-dim-overlay]').exists()).toBe(true)
  })

  it('concluir passeio asks confirmation before emitting complete', async () => {
    const { wrapper } = setup('provider')
    await wrapper.get('[data-complete-open]').trigger('click')
    expect(wrapper.emitted('complete')).toBeUndefined()
    const confirm = document.body.querySelector('[data-complete-confirm]')
    expect(confirm).not.toBeNull()
    confirm.click()
    await flushPromises()
    expect(wrapper.emitted('complete')).toHaveLength(1)
  })

  // .maplibregl-map (CSS fora de @layer) força position:relative e anula `absolute inset-0`:
  // o container precisa de altura própria ou o mapa fica com 0px.
  it('map container has its own size, not absolute positioning', () => {
    const { wrapper } = setup('client')
    const map = wrapper.find('#service-active-map')
    expect(map.classes()).toEqual(expect.arrayContaining(['h-full', 'w-full']))
    expect(map.classes()).not.toContain('absolute')
  })

  it('tutor has no complete button', () => {
    const { wrapper } = setup('client')
    expect(wrapper.find('[data-complete-open]').exists()).toBe(false)
  })
})
