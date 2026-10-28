import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'

const mapApi = {
  createMap: vi.fn(),
  addMarker: vi.fn(() => ({})),
  drawRoute: vi.fn(),
  loaded: ref(true),
}
vi.mock('@/composables/useMap', () => ({ useMap: () => mapApi, getThemeColor: () => '#000' }))
const serviceApi = vi.hoisted(() => ({ getServiceEvents: vi.fn() }))
vi.mock('@/services/service', () => serviceApi)
vi.mock('@/utils/notify', () => ({ default: { success: vi.fn(), error: vi.fn(), info: vi.fn() } }))

import ServiceRouteMap from '../ServiceRouteMap.vue'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

const ev = (id, kind, extra = {}) => ({ id, kind, latitude: -26.3, longitude: -48.8, image_url: null, created_at: '2026-10-28T12:00:00Z', ...extra })

function setup(service = {}) {
  const store = useServiceWebSocketStore()
  store.setService({ id: 1, status: 4, pets: [], provider_name: 'Bob', ...service })
  const wrapper = mount(ServiceRouteMap, {
    props: { role: 'provider', isServiceRating: true },
    attachTo: document.body,
    global: { stubs: { SearchCard: true, ServicePetsList: true, InfoCard: true, ReviewModal: true } },
  })
  return { store, wrapper }
}

describe('ServiceRouteMap relatório', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    serviceApi.getServiceEvents.mockResolvedValue([])
  })
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows counts, event markers on the map and hides empty note', async () => {
    const { store, wrapper } = setup()
    store.events.push(ev(1, 'pee'), ev(2, 'pee'), ev(3, 'poop'), ev(4, 'water', { latitude: null, longitude: null }))
    await flushPromises()
    const counts = wrapper.get('[data-event-counts]').text()
    expect(counts).toContain('Xixi 2')
    expect(counts).toContain('Cocô 1')
    expect(counts).toContain('Água 1')
    const elementMarkers = mapApi.addMarker.mock.calls.filter((c) => c[2]?.element)
    expect(elementMarkers).toHaveLength(3)
    expect(wrapper.find('[data-provider-note]').exists()).toBe(false)
  })

  it('shows provider note card', () => {
    const { wrapper } = setup({ provider_note: 'Caramelo bebeu água' })
    expect(wrapper.get('[data-provider-note]').text()).toContain('Caramelo bebeu água')
  })

  it('photo thumbnail opens large image in a sheet', async () => {
    const { store, wrapper } = setup()
    store.events.push(ev(1, 'photo', { image_url: 'http://x/a.jpg' }))
    await flushPromises()
    const thumbs = wrapper.findAll('[data-photo-thumb]')
    expect(thumbs).toHaveLength(1)
    await thumbs[0].trigger('click')
    await flushPromises()
    expect(document.body.querySelector('[data-photo-large]').getAttribute('src')).toBe('http://x/a.jpg')
  })

  it('loads events on mount even when store already has a WS event, merging by id', async () => {
    serviceApi.getServiceEvents.mockResolvedValue([ev(1, 'pee'), ev(2, 'poop')])
    const store = useServiceWebSocketStore()
    store.setService({ id: 1, status: 4, pets: [], provider_name: 'Bob' })
    store.events.push(ev(2, 'poop'))
    mount(ServiceRouteMap, {
      props: { role: 'provider', isServiceRating: true },
      attachTo: document.body,
      global: { stubs: { SearchCard: true, ServicePetsList: true, InfoCard: true, ReviewModal: true } },
    })
    await flushPromises()
    expect(serviceApi.getServiceEvents).toHaveBeenCalledWith(1)
    expect(store.events.map((e) => e.id).sort()).toEqual([1, 2])
  })

  it('loads events on mount when store is empty', async () => {
    serviceApi.getServiceEvents.mockResolvedValue([ev(5, 'water')])
    const { store } = setup()
    await flushPromises()
    expect(serviceApi.getServiceEvents).toHaveBeenCalledWith(1)
    expect(store.events).toHaveLength(1)
  })
})
