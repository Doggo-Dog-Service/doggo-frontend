import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'
import { useProviderStore } from '@/stores/provider'

const geo = vi.hoisted(() => ({ impl: null, lat: null, lon: null }))

vi.mock('@/composables/useGeolocation', async () => {
  const { ref } = await import('vue')
  const latitude = ref(null)
  const longitude = ref(null)
  return {
    useGeolocation: () => ({
      latitude,
      longitude,
      getCurrentPosition: () => {
        latitude.value = geo.lat
        longitude.value = geo.lon
        return geo.impl()
      },
    }),
  }
})

const RouterLinkStub = { props: ['to'], template: '<a><slot /></a>' }

let auth, services, providers

function setup() {
  geo.impl = () => Promise.reject(new Error('negado'))
  geo.lat = null
  geo.lon = null
  setActivePinia(createPinia())
  auth = useAuthStore()
  auth.user = { full_name: 'Maria da Silva', client_profile: { id: 3 } }
  services = useServiceStore()
  providers = useProviderStore()
  services.getServices = vi.fn().mockResolvedValue()
  providers.fetchProviders = vi.fn().mockResolvedValue()
}


// pinia ativo precisa ser o mesmo do mount
const mountWithPinia = () => {
  const w = mount(HomeView, {
    global: { plugins: [getActivePinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  return w
}

describe('HomeView', () => {
  beforeEach(setup)

  it('saudacao usa o primeiro nome', async () => {
    const w = mountWithPinia()
    await flushPromises()
    expect(w.text()).toContain('Olá, Maria')
    expect(w.text()).not.toContain('Maria da Silva')
  })

  it('busca passeios do tutor com page_size 100', async () => {
    mountWithPinia()
    await flushPromises()
    expect(services.getServices).toHaveBeenCalledWith({ client: 3, page_size: 100 })
  })

  it('mostra skeleton durante carregamento', async () => {
    services.getServices = vi.fn(() => {
      services.loading = true
      return new Promise(() => {})
    })
    const w = mountWithPinia()
    await flushPromises()
    expect(w.find('[data-testid="home-skeleton"]').exists()).toBe(true)
  })

  it('erro mostra tentar novamente e o clique refaz as chamadas', async () => {
    services.getServices = vi.fn(async () => {
      services.serviceError = 'falhou'
    })
    const w = mountWithPinia()
    await flushPromises()
    const btn = w.findAll('button').find((b) => b.text().includes('Tentar novamente'))
    expect(btn).toBeTruthy()
    const before = services.getServices.mock.calls.length
    const beforeP = providers.fetchProviders.mock.calls.length
    await btn.trigger('click')
    await flushPromises()
    expect(services.getServices.mock.calls.length).toBe(before + 1)
    expect(providers.fetchProviders.mock.calls.length).toBe(beforeP + 1)
  })

  it('lista vazia mostra mensagem', async () => {
    const w = mountWithPinia()
    await flushPromises()
    expect(w.text()).toContain('Nenhum passeador perto de você ainda')
  })

  it('limita a 8 passeadores', async () => {
    providers.fetchProviders = vi.fn(async () => {
      providers.providers = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        full_name: `P${i + 1}`,
        price_per_hour: '30',
      }))
    })
    const w = mountWithPinia()
    await flushPromises()
    expect(w.findAll('[data-testid="nearby-provider"]').length).toBe(8)
  })

  it('nao lista o proprio perfil de passeador entre os proximos', async () => {
    auth.user = { full_name: 'Maria', client_profile: { id: 3 }, provider_profile: { id: 2 } }
    providers.fetchProviders = vi.fn(async () => {
      providers.providers = [
        { id: 1, full_name: 'Outro', price_per_hour: '30' },
        { id: 2, full_name: 'Eu mesma', price_per_hour: '30' },
      ]
    })
    const w = mountWithPinia()
    await flushPromises()
    expect(w.findAll('[data-testid="nearby-provider"]').length).toBe(1)
    expect(w.text()).not.toContain('Eu mesma')
  })

  it('geolocalizacao que nunca responde: busca sem lat/lon apos timeout', async () => {
    vi.useFakeTimers()
    geo.impl = () => new Promise(() => {})
    mountWithPinia()
    await vi.advanceTimersByTimeAsync(4900)
    expect(providers.fetchProviders).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(200)
    expect(providers.fetchProviders).toHaveBeenCalledWith({})
    vi.useRealTimers()
  })

  it('geolocalizacao ok: envia lat/lon', async () => {
    geo.lat = '-23.550000'
    geo.lon = '-46.630000'
    geo.impl = () => Promise.resolve()
    mountWithPinia()
    await flushPromises()
    expect(providers.fetchProviders).toHaveBeenCalledWith({ lat: '-23.550000', lon: '-46.630000' })
  })

  it('geolocalizacao indisponivel (sem coordenadas): nao envia lat/lon nulos', async () => {
    geo.impl = () => Promise.resolve()
    mountWithPinia()
    await flushPromises()
    expect(providers.fetchProviders).toHaveBeenCalledWith({})
  })

  it('nao mostra estado vazio antes do primeiro carregamento de passeios', async () => {
    services.getServices = vi.fn(() => new Promise(() => {}))
    const w = mountWithPinia()
    await flushPromises()
    expect(w.text()).not.toContain('Agendar passeio')
    expect(w.find('[data-testid="home-skeleton"]').exists()).toBe(true)
  })
})
