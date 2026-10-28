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
  coords: { lat: '-23.550500', lon: '-46.633300' },
  addMarker: vi.fn(),
}))

vi.mock('@/composables/useMap', () => ({
  getThemeColor: (_name, fallback) => fallback,
  useMap: () => {
    const map = ref({ on: (event, cb) => (mocks.handlers[event] = cb) })
    return { map, createMap: mocks.createMap, addMarker: mocks.addMarker, flyTo: mocks.flyTo }
  },
}))
vi.mock('@/composables/useGeolocation', () => ({
  useGeolocation: () => ({
    latitude: ref(mocks.coords.lat),
    longitude: ref(mocks.coords.lon),
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
    mocks.coords.lat = '-23.550500'
    mocks.coords.lon = '-46.633300'
    mocks.addMarker.mockImplementation(() => mocks.marker)
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

  it('geolocalizacao que nunca responde: apos 5s avisa e cria o mapa em Sao Paulo', async () => {
    vi.useFakeTimers()
    try {
      mocks.getCurrentPosition.mockReturnValue(new Promise(() => {}))
      const wrapper = mount(ProviderLocationPicker, { props: { modelValue: { latitude: null, longitude: null } } })
      await vi.advanceTimersByTimeAsync(4900)
      expect(mocks.createMap).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(200)
      expect(mocks.createMap).toHaveBeenCalledTimes(1)
      expect(mocks.createMap.mock.calls[0][1]).toEqual([-46.633309, -23.55052])
      expect(wrapper.emitted('error')[0][0]).toContain('localização')
    } finally {
      vi.useRealTimers()
    }
  })

  it('sem localizacao nem escolha nao desenha marcador; o primeiro toque cria', async () => {
    mocks.coords.lat = null
    mocks.coords.lon = null
    const wrapper = mount(ProviderLocationPicker, { props: { modelValue: { latitude: null, longitude: null } } })
    await vi.waitFor(() => expect(mocks.handlers.click).toBeTypeOf('function'))
    expect(mocks.addMarker).not.toHaveBeenCalled()
    mocks.handlers.click({ lngLat: { lng: -43.1, lat: -22.9 } })
    expect(mocks.addMarker).toHaveBeenCalledTimes(1)
    expect(mocks.addMarker.mock.calls[0].slice(0, 2)).toEqual([-43.1, -22.9])
    expect(wrapper.emitted('update:modelValue').at(-1)[0]).toEqual({ latitude: -22.9, longitude: -43.1 })
  })

  it('Enter na busca de endereco nao envia o formulario', async () => {
    const wrapper = mount(ProviderLocationPicker, {
      props: { modelValue: { latitude: null, longitude: null } },
      attachTo: document.body,
    })
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    wrapper.find('input').element.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    wrapper.unmount()
  })
})
