import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

const mocks = vi.hoisted(() => ({
  handlers: {},
  marker: { setLngLat: vi.fn(), on: vi.fn(), getLngLat: vi.fn() },
  flyTo: vi.fn(),
  createMap: vi.fn(),
  getCurrentPosition: vi.fn(),
  geoError: { value: null },
}))

vi.mock('@/composables/useMap', () => ({
  getThemeColor: (_name, fallback) => fallback,
  useMap: () => {
    const map = ref({ on: (event, cb) => (mocks.handlers[event] = cb) })
    return { map, createMap: mocks.createMap, addMarker: vi.fn(() => mocks.marker), flyTo: mocks.flyTo }
  },
}))
vi.mock('@/composables/useGeolocation', () => ({
  useGeolocation: () => ({
    latitude: ref('-23.550500'),
    longitude: ref('-46.633300'),
    error: mocks.geoError,
    getCurrentPosition: mocks.getCurrentPosition,
  }),
}))
vi.mock('@/composables/useLocation', () => ({
  useLocation: () => ({ searchedData: ref([]), searchLocation: vi.fn(), loading: ref(false) }),
}))

import ProviderLocationPicker from '../ProviderLocationPicker.vue'

describe('ProviderLocationPicker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.handlers = {}
    mocks.geoError.value = null
    mocks.getCurrentPosition.mockResolvedValue({})
  })

  it('emite coordenadas com 6 casas ao clicar no mapa', async () => {
    const wrapper = mount(ProviderLocationPicker, { props: { modelValue: { latitude: null, longitude: null } } })
    await vi.waitFor(() => expect(mocks.handlers.click).toBeTypeOf('function'))
    mocks.handlers.click({ lngLat: { lng: -46.6333004, lat: -23.5505199 } })
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual({ latitude: -23.55052, longitude: -46.6333 })
    expect(mocks.marker.setLngLat).toHaveBeenCalledWith([-46.6333004, -23.5505199])
  })

  it('desmontar durante a geolocalizacao nao cria o mapa', async () => {
    let resolve
    mocks.getCurrentPosition.mockReturnValue(new Promise((r) => (resolve = r)))
    const wrapper = mount(ProviderLocationPicker, { props: { modelValue: { latitude: null, longitude: null } } })
    wrapper.unmount()
    resolve({})
    await new Promise((r) => setTimeout(r, 0))
    expect(mocks.createMap).not.toHaveBeenCalled()
  })

  it('sem geolocalizacao avisa e ainda cria o mapa', async () => {
    mocks.getCurrentPosition.mockImplementation(async () => {
      mocks.geoError.value = 'Geolocalização indisponível'
    })
    const wrapper = mount(ProviderLocationPicker, { props: { modelValue: { latitude: null, longitude: null } } })
    await vi.waitFor(() => expect(mocks.createMap).toHaveBeenCalled())
    expect(wrapper.emitted('error')[0][0]).toContain('localização')
  })

  it('arrastar o marcador tambem emite', async () => {
    const wrapper = mount(ProviderLocationPicker, { props: { modelValue: { latitude: null, longitude: null } } })
    await vi.waitFor(() => expect(mocks.marker.on).toHaveBeenCalled())
    mocks.marker.getLngLat.mockReturnValue({ lng: -43.1729123, lat: -22.9068467 })
    mocks.marker.on.mock.calls.find(([e]) => e === 'dragend')[1]()
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual({ latitude: -22.906847, longitude: -43.172912 })
  })
})
