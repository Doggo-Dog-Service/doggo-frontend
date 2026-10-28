import { ref } from 'vue'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import ProviderView from '@/views/ProviderView.vue'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useReviewStore } from '@/stores/review'

const route = vi.hoisted(() => ({ params: { id: '7' } }))
vi.mock('vue-router', () => ({ useRoute: () => route }))
vi.mock('@/composables/useLocation', () => ({
  useLocation: () => ({ cityName: ref('Joinville - SC'), setLocation: vi.fn() }),
}))

const RouterLinkStub = {
  props: ['to'],
  template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
}

const provider = {
  id: 7,
  full_name: 'Maria Souza',
  profile_picture: null,
  fixed_latitude: '-26.3',
  fixed_longitude: '-48.8',
  service_type_name: 'Dog Walking',
  price_per_hour: '35.00',
  price_per_day: '120.00',
  description: 'Amo cães.',
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  classification: 4.5,
  rating_count: 12,
  availability: [
    { id: 1, weekday: 0, weekday_label: 'Segunda', start_time: '08:00:00', end_time: '12:00:00' },
    { id: 2, weekday: 0, weekday_label: 'Segunda', start_time: '14:00:00', end_time: '18:00:00' },
    { id: 3, weekday: 2, weekday_label: 'Quarta', start_time: '09:00:00', end_time: '11:00:00' },
  ],
}

const reviews = [{ id: 1, rating: 5, comment: 'Excelente!', client_name: 'João', client_picture: null }]

async function mountView({
  mode = 'client',
  user = { client_profile: { id: 3 } },
  data = provider,
  fetchError = null,
} = {}) {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.user = user
  auth.mode = mode
  const providers = useProviderStore()
  providers.fetchProvider = fetchError
    ? vi.fn().mockRejectedValue(fetchError)
    : vi.fn().mockResolvedValue(data)
  const rev = useReviewStore()
  rev.getReviews = vi.fn().mockResolvedValue()
  rev.reviews = reviews
  const w = mount(ProviderView, {
    global: { plugins: [getActivePinia()], stubs: { RouterLink: RouterLinkStub } },
  })
  await flushPromises()
  return w
}

describe('ProviderView', () => {
  beforeEach(() => {
    route.params = { id: '7' }
  })

  it('mostra nota, quantidade, preco e tipo', async () => {
    const w = await mountView()
    const text = w.text()
    expect(text).toContain('Maria Souza')
    expect(text).toContain('4,5')
    expect(text).toContain('12 avaliações')
    expect(text).toContain('35,00')
    expect(text).toContain('Dog Walking')
    expect(text).toContain('Joinville - SC')
    expect(text).toContain('Amo cães.')
  })

  it('disponibilidade agrupada por dia usando a lista aninhada', async () => {
    const w = await mountView()
    const days = w.findAll('[data-testid="availability-day"]')
    expect(days).toHaveLength(2)
    expect(days[0].text()).toContain('Segunda')
    expect(days[0].text()).toContain('08:00 – 12:00')
    expect(days[0].text()).toContain('14:00 – 18:00')
    expect(days[1].text()).toContain('Quarta')
  })

  it('sem disponibilidade mostra aviso', async () => {
    const w = await mountView({ data: { ...provider, availability: [] } })
    expect(w.text()).toContain('Sem horários cadastrados')
  })

  it('lista avaliacoes', async () => {
    const w = await mountView()
    expect(w.text()).toContain('Excelente!')
    expect(w.text()).toContain('João')
  })

  it('tutor ve barra Agendar passeio para scheduling-view', async () => {
    const w = await mountView()
    const link = w.find('[data-testid="schedule-bar"] a')
    expect(link.text()).toContain('Agendar passeio')
    expect(JSON.parse(link.attributes('data-to'))).toEqual({
      name: 'scheduling-view',
      params: { providerId: 7 },
    })
  })

  it('passeador visitando outro perfil nao ve barra', async () => {
    const w = await mountView({ mode: 'provider', user: { provider_profile: { id: 99 } } })
    expect(w.find('[data-testid="schedule-bar"]').exists()).toBe(false)
  })

  it('proprio passeador ve Editar perfil e nao a barra', async () => {
    const w = await mountView({
      mode: 'provider',
      user: { client_profile: { id: 3 }, provider_profile: { id: 7 } },
    })
    expect(w.find('[data-testid="schedule-bar"]').exists()).toBe(false)
    const edit = w.findAll('a').find((a) => a.text().includes('Editar perfil'))
    expect(JSON.parse(edit.attributes('data-to'))).toEqual({ name: 'profile-view' })
  })

  it('tutor dono do perfil em modo client nao ve barra', async () => {
    const w = await mountView({ user: { client_profile: { id: 3 }, provider_profile: { id: 7 } } })
    expect(w.find('[data-testid="schedule-bar"]').exists()).toBe(false)
  })

  it('erro ao carregar mostra estado de erro', async () => {
    const w = await mountView({ data: null })
    expect(w.text()).toContain('Não foi possível carregar este perfil')
  })

  it('fetch rejeitado mostra estado de erro', async () => {
    const w = await mountView({ fetchError: new Error('rede') })
    expect(w.text()).toContain('Não foi possível carregar este perfil')
  })

  it('com avaliacoes e nota nula mostra traco e nao 0,0', async () => {
    const w = await mountView({ data: { ...provider, rating_count: 3, classification: null } })
    expect(w.text()).not.toContain('0,0')
    expect(w.text()).toContain('—')
  })
})
