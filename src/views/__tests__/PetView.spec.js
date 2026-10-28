import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, getActivePinia, setActivePinia } from 'pinia'
import PetView from '@/views/PetView.vue'
import { useAuthStore } from '@/stores/auth'
import { usePetStore } from '@/stores/pet'

vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

const pet = (id, extra = {}) => ({
  id,
  name: `Pet ${id}`,
  breed: 'Vira-lata',
  size: 'm',
  weight: '12.500',
  pet_picture: null,
  ...extra,
})

function mountView({ pets = [], loading = false, error = '', fetchUserFails = false } = {}) {
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.user = { client_profile: { id: 3 } }
  auth.fetchUser = fetchUserFails
    ? vi.fn().mockRejectedValue(new Error('rede'))
    : vi.fn().mockResolvedValue()
  const store = usePetStore()
  store.getPets = vi.fn().mockResolvedValue()
  store.pets = pets
  store.loading = loading
  store.error = error
  const w = mount(PetView, {
    global: { plugins: [getActivePinia()], stubs: { PetModal: true } },
  })
  return { w, store }
}

describe('PetView', () => {
  it('mostra grade com nome, raca, porte e peso', async () => {
    const { w } = mountView({ pets: [pet(1), pet(2, { size: 'g', weight: null })] })
    await flushPromises()
    expect(w.findAll('li')).toHaveLength(2)
    expect(w.text()).toContain('Pet 1')
    expect(w.text()).toContain('Vira-lata')
    expect(w.text()).toContain('Médio')
    expect(w.text()).toContain('12,5 kg')
    expect(w.text()).toContain('Grande')
  })

  it('estado vazio', async () => {
    const { w } = mountView()
    await flushPromises()
    expect(w.text()).toContain('Você ainda não possui nenhum pet cadastrado')
    expect(w.find('li').exists()).toBe(false)
  })

  it('estado de carregamento sem lista nem vazio', async () => {
    const { w } = mountView({ loading: true })
    await flushPromises()
    expect(w.find('[aria-busy="true"]').exists()).toBe(true)
    expect(w.text()).not.toContain('Você ainda não possui')
  })

  it('estado de erro com tentar novamente', async () => {
    const { w, store } = mountView({ error: 'Falhou' })
    await flushPromises()
    expect(w.text()).toContain('Não foi possível carregar seus pets')
    store.getPets.mockClear()
    await w
      .findAll('button')
      .find((b) => b.text() === 'Tentar novamente')
      .trigger('click')
    expect(store.getPets).toHaveBeenCalledWith({ owner: 3 })
  })

  it('botao adicionar pet abre modal no modo add', async () => {
    const { w } = mountView()
    await flushPromises()
    await w
      .findAll('button')
      .find((b) => b.text() === 'Adicionar pet')
      .trigger('click')
    const modal = w.findComponent({ name: 'PetModal' })
    expect(modal.exists()).toBe(true)
    expect(modal.props('mode')).toBe('add')
  })

  it('fetchUser falha: mostra erro e nao fica no skeleton', async () => {
    const { w } = mountView({ fetchUserFails: true })
    await flushPromises()
    expect(w.find('[aria-busy="true"]').exists()).toBe(false)
    expect(w.text()).toContain('Não foi possível carregar seus pets')
  })
})
