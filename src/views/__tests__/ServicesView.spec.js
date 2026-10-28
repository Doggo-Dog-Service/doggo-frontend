import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import ServicesView from '@/views/ServicesView.vue'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/services'

const route = vi.hoisted(() => ({ meta: {}, query: {} }))
vi.mock('vue-router', () => ({ useRoute: () => route }))

const RouterLinkStub = { props: ['to'], template: '<a :href="to"><slot /></a>' }
const day = 86400000
const iso = (offset) => new Date(Date.now() + offset).toISOString()

const mk = (id, status, offset, extra = {}) => ({
  id,
  status,
  client_name: `Tutor ${id}`,
  client_picture: null,
  provider_name: `Passeador ${id}`,
  provider_picture: null,
  service_type: 'Dog Walking',
  pets: [{ id: 1, name: 'Rex', pet_picture: null }],
  price: '35.00',
  start_datetime: iso(offset),
  created_at: iso(offset),
  ...extra,
})

let services

function mountView(list) {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.user = { client_profile: { id: 3 } }
  auth.mode = 'client'
  services = useServiceStore()
  services.getServices = vi.fn().mockResolvedValue()
  services.serivces = list
  return mount(ServicesView, {
    global: { plugins: [getActivePinia()], stubs: { RouterLink: RouterLinkStub } },
  })
}

describe('ServicesView agrupada', () => {
  beforeEach(() => {
    route.meta = {}
    route.query = {}
  })

  it('mostra secoes com contagem', async () => {
    const w = mountView([mk(1, 2, 0), mk(2, 2, 3 * day), mk(3, 2, 4 * day), mk(4, 4, -3 * day)])
    await flushPromises()
    const text = w.text()
    expect(text).toContain('Hoje')
    expect(text).toContain('Próximos')
    expect(text).toContain('Anteriores')
    expect(w.find('[data-testid="group-today"] [data-testid="count"]').text()).toBe('1')
    expect(w.find('[data-testid="group-upcoming"] [data-testid="count"]').text()).toBe('2')
    expect(w.find('[data-testid="group-past"] [data-testid="count"]').text()).toBe('1')
  })

  it('secao vazia nao aparece', async () => {
    const w = mountView([mk(4, 4, -3 * day)])
    await flushPromises()
    expect(w.find('[data-testid="group-today"]').exists()).toBe(false)
    expect(w.find('[data-testid="group-upcoming"]').exists()).toBe(false)
    expect(w.find('[data-testid="group-past"]').exists()).toBe(true)
  })

  it('tudo vazio mostra estado vazio', async () => {
    const w = mountView([])
    await flushPromises()
    expect(w.text()).toContain('Nenhum serviço encontrado.')
    expect(w.find('[data-testid^="group-"]').exists()).toBe(false)
  })

  it('chip de status recarrega com status', async () => {
    const w = mountView([mk(1, 2, 0)])
    await flushPromises()
    await w.findAll('button[aria-pressed]')[3].trigger('click')
    await flushPromises()
    expect(services.getServices).toHaveBeenLastCalledWith({ client: 3, page_size: 100, status: 4 })
  })

  it('rota Pedidos filtra status 1 e sem chips', async () => {
    route.meta = { filter: 'pendentes' }
    const w = mountView([mk(1, 1, 3 * day), mk(2, 2, 3 * day)])
    await flushPromises()
    expect(w.findAll('a')).toHaveLength(1)
    expect(w.find('button[aria-pressed]').exists()).toBe(false)
    expect(w.find('[data-testid="group-upcoming"]').exists()).toBe(true)
  })

  it('rota Hoje filtra ativos', async () => {
    route.meta = { filter: 'ativos' }
    const w = mountView([mk(1, 2, 0), mk(2, 4, 0), mk(3, 3, 0)])
    await flushPromises()
    expect(w.findAll('a')).toHaveLength(2)
  })

  it('card mostra pets, outro participante, preco, data e status', async () => {
    const w = mountView([mk(1, 2, 3 * day)])
    await flushPromises()
    const text = w.text()
    expect(text).toContain('Rex')
    expect(text).toContain('Passeador 1')
    expect(text).not.toContain('Tutor 1')
    expect(text).toContain('35,00')
    expect(text).toContain('Confirmado')
    expect(w.find('a').attributes('href')).toBe('/service/1')
  })

  it('carregando mostra skeleton sem lista nem vazio', async () => {
    const w = mountView([])
    services.loading = true
    await flushPromises()
    expect(w.find('[role="status"][aria-label="Carregando serviços"]').exists()).toBe(true)
    expect(w.text()).not.toContain('Nenhum serviço encontrado.')
  })

  it('erro mostra mensagem e tentar novamente recarrega', async () => {
    const w = mountView([])
    services.serviceError = 'Falhou'
    await flushPromises()
    expect(w.text()).toContain('Não foi possível carregar os passeios')
    services.getServices.mockClear()
    await w
      .findAll('button')
      .find((b) => b.text() === 'Tentar novamente')
      .trigger('click')
    expect(services.getServices).toHaveBeenCalledTimes(1)
  })
})
