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
vi.mock('@/services/service', () => ({ getServiceEvents: vi.fn().mockResolvedValue([]) }))
vi.mock('@/utils/notify', () => ({ default: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import ServiceActiveWalk from '../ServiceActiveWalk.vue'
import { useTheme } from '@/composables/useTheme'
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

  it('restyles map when app theme changes mid-walk, unless dim forces dark', async () => {
    const { setPreference } = useTheme()
    setPreference('light')
    mapApi.loaded.value = true
    const { wrapper } = setup('client')
    mapApi.setStyle.mockClear()
    setPreference('dark')
    await flushPromises()
    expect(mapApi.setStyle).toHaveBeenCalledWith('dark')
    setPreference('light')
    await flushPromises()
    expect(mapApi.setStyle).toHaveBeenLastCalledWith('light')
    wrapper.unmount()

    sessionStorage.setItem('doggo-walk-dim', '1')
    setup('provider')
    mapApi.setStyle.mockClear()
    setPreference('dark')
    setPreference('light')
    await flushPromises()
    expect(mapApi.setStyle).not.toHaveBeenCalledWith('light')
  })

  it('does not declare a cancel emit', () => {
    const { wrapper } = setup('provider')
    expect(wrapper.vm.$options.emits).toEqual(['complete'])
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

  describe('marcadores', () => {
    const ev = (id, kind = 'pee', extra = {}) => ({ id, kind, latitude: -26.3, longitude: -48.8, image_url: null, created_at: '2026-10-28T12:00:00Z', ...extra })

    it('provider: action bar calls addEvent per kind', async () => {
      const { store, wrapper } = setup('provider')
      const spy = vi.spyOn(store, 'addEvent').mockResolvedValue(null)
      for (const kind of ['pee', 'poop', 'water']) {
        await wrapper.get(`[data-event-${kind}]`).trigger('click')
        expect(spy).toHaveBeenLastCalledWith(kind)
      }
      expect(wrapper.text()).toContain('Xixi')
      expect(wrapper.text()).toContain('Cocô')
      expect(wrapper.text()).toContain('Água')
      expect(wrapper.text()).toContain('Foto')
    })

    it('provider: photo input opens camera and uploads chosen file', async () => {
      const { store, wrapper } = setup('provider')
      const spy = vi.spyOn(store, 'addEvent').mockResolvedValue(null)
      const input = wrapper.get('[data-event-photo-input]')
      expect(input.attributes('accept')).toBe('image/*')
      expect(input.attributes('capture')).toBe('environment')
      const file = new File(['a'], 'a.jpg', { type: 'image/jpeg' })
      Object.defineProperty(input.element, 'files', { value: [file] })
      await input.trigger('change')
      expect(spy).toHaveBeenCalledWith('photo', file)
    })

    it('tutor: no action bar', () => {
      const { wrapper } = setup('client')
      expect(wrapper.find('[data-event-pee]').exists()).toBe(false)
      expect(wrapper.find('[data-event-photo-input]').exists()).toBe(false)
    })

    it('tutor: WS event adds one map marker and one list item, no duplicate', async () => {
      const { store, wrapper } = setup('client')
      await flushPromises()
      mapApi.addMarker.mockClear()
      store.handleWalkEvent({ service_id: 1, event: ev(1) })
      store.handleWalkEvent({ service_id: 1, event: ev(1) })
      await flushPromises()
      expect(mapApi.addMarker).toHaveBeenCalledTimes(1)
      expect(wrapper.findAll('[data-event-item]')).toHaveLength(1)
    })

    it('event without position is listed but not on the map', async () => {
      const { store, wrapper } = setup('client')
      await flushPromises()
      mapApi.addMarker.mockClear()
      store.handleWalkEvent({ service_id: 1, event: ev(2, 'water', { latitude: null, longitude: null }) })
      await flushPromises()
      expect(mapApi.addMarker).not.toHaveBeenCalled()
      expect(wrapper.findAll('[data-event-item]')).toHaveLength(1)
    })
  })
})
