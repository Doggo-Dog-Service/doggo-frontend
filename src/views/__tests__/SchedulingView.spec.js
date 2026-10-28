import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import SchedulingView from '@/views/SchedulingView.vue'
import CalendarPicker from '@/components/calendar/CalendarPicker.vue'
import SchedulingSlots from '@/components/inputs/SchedulingSlots.vue'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'
import { useProviderStore } from '@/stores/provider'
import { useServiceTypeStore } from '@/stores/serviceType'
import { useAvailabilityStore } from '@/stores/availability'
import { createService } from '@/services/service'
import notify from '@/utils/notify'

vi.mock('@/services/service', () => ({ createService: vi.fn() }))
vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))

const PetModalStub = {
  props: ['mode'],
  emits: ['close'],
  template:
    '<div data-test="pet-modal"><button data-test="close-modal" @click="$emit(\'close\')">x</button></div>',
}
const RouterLinkStub = { props: ['to'], template: '<a :data-to="JSON.stringify(to)"><slot /></a>' }

let router, pets, availability, getPetsCalls

async function setup(
  url = '/scheduling/7',
  petList = [{ id: 1, name: 'Rex', breed: 'SRD' }],
  {
    provider = undefined,
    typeList = [{ id: 5, name: 'Passeio', duration_minutes: 60 }],
    attach = false,
  } = {},
) {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.user = { client_profile: { id: 3 } }
  pets = usePetStore()
  getPetsCalls = 0
  pets.getPets = vi.fn(async () => {
    getPetsCalls += 1
    pets.pets = petList
  })
  const providers = useProviderStore()
  providers.fetchProvider = vi.fn().mockResolvedValue(
    provider === undefined
      ? {
          id: 7,
          full_name: 'Carlos',
          service_type_name: 'Passeio',
          price_per_hour: '40.00',
          is_active: true,
        }
      : provider,
  )
  const types = useServiceTypeStore()
  types.getTypeServices = vi.fn(async () => {
    types.typeServices = typeList
  })
  availability = useAvailabilityStore()
  availability.getSlots = vi.fn(async () => {
    availability.slots = ['09:00', '10:00']
  })

  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home-view', component: { template: '<i />' } },
      { path: '/services', name: 'services-view', component: { template: '<i />' } },
      { path: '/scheduling/:providerId', name: 'scheduling-view', component: SchedulingView },
    ],
  })
  router.push(url)
  await router.isReady()
  const wrapper = mount(SchedulingView, {
    attachTo: attach ? document.body : undefined,
    global: {
      plugins: [router],
      stubs: { PetModal: PetModalStub, RouterLink: RouterLinkStub },
    },
  })
  await flushPromises()
  return wrapper
}

const next = (w) => w.find('[data-test="next"]')
const button = (w, text) => w.findAll('button').find((b) => b.text().includes(text))
const pickDay = async (w) => {
  w.findComponent(CalendarPicker).vm.$emit('update:modelValue', new Date(2030, 0, 15))
  await flushPromises()
}
const pickTime = async (w) => {
  w.findComponent(SchedulingSlots).vm.$emit('update:modelValue', '09:00')
  await flushPromises()
}

async function toStep3(w) {
  await button(w, 'Rex').trigger('click')
  await next(w).trigger('click')
  await flushPromises()
  await pickDay(w)
  await pickTime(w)
  await next(w).trigger('click')
  await flushPromises()
}

beforeEach(() => vi.clearAllMocks())

describe('SchedulingView', () => {
  it('passo 1 bloqueia sem pet selecionado', async () => {
    const w = await setup()
    expect(w.text()).toContain('Quem vai passear?')
    expect(next(w).attributes('disabled')).toBeDefined()
    await button(w, 'Rex').trigger('click')
    expect(next(w).attributes('disabled')).toBeUndefined()
  })

  it('sem pets mostra Cadastrar pet, abre modal e recarrega pets ao fechar', async () => {
    const w = await setup('/scheduling/7', [])
    const before = getPetsCalls
    await button(w, 'Cadastrar pet').trigger('click')
    expect(w.find('[data-test="pet-modal"]').exists()).toBe(true)
    await w.find('[data-test="close-modal"]').trigger('click')
    await flushPromises()
    expect(w.find('[data-test="pet-modal"]').exists()).toBe(false)
    expect(getPetsCalls).toBe(before + 1)
  })

  it('passo 2 bloqueia sem horário', async () => {
    const w = await setup()
    await button(w, 'Rex').trigger('click')
    await next(w).trigger('click')
    await flushPromises()
    expect(w.text()).toContain('Quando?')
    expect(next(w).attributes('disabled')).toBeDefined()
    await pickDay(w)
    await pickTime(w)
    expect(next(w).attributes('disabled')).toBeUndefined()
  })

  it('?etapa=3 sem pet/horário volta ao passo 1', async () => {
    const w = await setup('/scheduling/7?etapa=3')
    expect(w.text()).toContain('Quem vai passear?')
    expect(router.currentRoute.value.query.etapa).toBe('1')
  })

  it('envia o payload exato uma vez mesmo com duplo clique e mostra sucesso', async () => {
    let resolve
    createService.mockReturnValue(new Promise((r) => (resolve = r)))
    const w = await setup()
    await toStep3(w)
    expect(w.text()).toContain('Revise e solicite')
    const btn = w.find('[data-test="submit"]')
    await btn.trigger('click')
    await btn.trigger('click')
    expect(createService).toHaveBeenCalledTimes(1)
    expect(createService.mock.calls[0][0]).toEqual({
      pets: [1],
      provider: 7,
      service_type: 5,
      start_datetime: expect.stringMatching(/^2030-01-15T09:00:00[+-]\d\d:\d\d$/),
    })
    resolve({ id: 1 })
    await flushPromises()
    expect(w.text()).toContain('Pedido enviado!')
    const links = w.findAll('a').map((a) => JSON.parse(a.attributes('data-to')))
    expect(links).toContainEqual({ name: 'services-view' })
    expect(links).toContainEqual({ name: 'home-view' })
  })

  it('409 volta ao passo 2, recarrega horários e avisa', async () => {
    createService.mockRejectedValue({ status: 409, message: 'x' })
    const w = await setup()
    await toStep3(w)
    availability.getSlots.mockClear()
    await w.find('[data-test="submit"]').trigger('click')
    await flushPromises()
    expect(notify.error).toHaveBeenCalledWith('Esse horário acabou de ser ocupado. Escolha outro.')
    expect(availability.getSlots).toHaveBeenCalled()
    expect(w.text()).toContain('Quando?')
    expect(router.currentRoute.value.query.etapa).toBe('2')
  })

  it('outro erro permanece no passo 3 com toast', async () => {
    createService.mockRejectedValue({ status: 500, message: 'falhou' })
    const w = await setup()
    await toStep3(w)
    await w.find('[data-test="submit"]').trigger('click')
    await flushPromises()
    expect(notify.error).toHaveBeenCalledWith('falhou')
    expect(w.text()).toContain('Revise e solicite')
  })

  it('provider não carregou: passo 3 não abre e mostra o erro', async () => {
    const w = await setup('/scheduling/7', undefined, { provider: null })
    expect(w.text()).toContain('Não foi possível carregar os dados deste profissional.')
    await button(w, 'Rex').trigger('click')
    await next(w).trigger('click')
    await flushPromises()
    await pickDay(w)
    await pickTime(w)
    expect(next(w).attributes('disabled')).toBeDefined()
    await router.push({ query: { etapa: '3' } })
    await flushPromises()
    expect(w.text()).not.toContain('Revise e solicite')
    expect(w.text()).toContain('Quando?')
  })

  it('sem tipo de serviço, enviar avisa em vez de ficar mudo', async () => {
    const w = await setup('/scheduling/7', undefined, { typeList: [] })
    await toStep3(w)
    notify.error.mockClear()
    await w.find('[data-test="submit"]').trigger('click')
    await flushPromises()
    expect(createService).not.toHaveBeenCalled()
    expect(notify.error).toHaveBeenCalledWith(
      'Não foi possível identificar o tipo de serviço deste passeador.',
    )
  })

  it('horário inválido (sem faltar tipo de serviço) mostra mensagem genérica', async () => {
    const w = await setup()
    await button(w, 'Rex').trigger('click')
    await next(w).trigger('click')
    await flushPromises()
    await pickDay(w)
    w.findComponent(SchedulingSlots).vm.$emit('update:modelValue', 'xx:yy')
    await flushPromises()
    await next(w).trigger('click')
    await flushPromises()
    notify.error.mockClear()
    await w.find('[data-test="submit"]').trigger('click')
    await flushPromises()
    expect(createService).not.toHaveBeenCalled()
    expect(notify.error).toHaveBeenCalledWith('Não foi possível solicitar o passeio. Tente novamente.')
  })

  it('mudar de passo move o foco para o título', async () => {
    const w = await setup('/scheduling/7', undefined, { attach: true })
    await button(w, 'Rex').trigger('click')
    await next(w).trigger('click')
    await flushPromises()
    expect(w.find('h1').text()).toBe('Quando?')
    expect(document.activeElement).toBe(w.find('h1').element)
    w.unmount()
  })
})
