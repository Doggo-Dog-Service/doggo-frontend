import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

import ProfileView from '../ProfileView.vue'
import notify from '@/utils/notify'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useServiceTypeStore } from '@/stores/serviceType'
import { buildProviderPayload } from '@/utils/providerForm'

const Picker = {
  name: 'ProviderLocationPicker',
  props: ['modelValue'],
  emits: ['update:modelValue'],
  template: '<button type="button" data-test="pick" @click="$emit(\'update:modelValue\', { latitude: \'-23.5\', longitude: \'-46.6\' })">pick</button>',
}
const SheetStub = { props: ['open', 'title'], template: '<div v-if="open" data-test="sheet"><slot /></div>' }

let auth, providers

function setup(user) {
  setActivePinia(createPinia())
  auth = useAuthStore()
  auth.user = user
  providers = useProviderStore()
  const types = useServiceTypeStore()
  types.getTypeServices = vi.fn()
  types.typeServices = [{ id: 1, name: 'Passeio' }]
  auth.fetchUser = vi.fn(async () => {
    auth.user = { ...auth.user, provider_profile: { id: 9 } }
  })
  return mount(ProfileView, {
    attachTo: document.body,
    global: { stubs: { ProviderLocationPicker: Picker, UiSheet: SheetStub, ModeSwitch: true } },
  })
}

const base = { id: 1, full_name: 'Ana', email: 'a@a.com' }
const button = (w, text) => w.findAll('button').find((b) => b.text().includes(text))

beforeEach(() => vi.clearAllMocks())

describe('ProfileView - quero passear também', () => {
  it('mostra o card só para tutor sem perfil de passeador', () => {
    expect(setup({ ...base, client_profile: { id: 1 } }).text()).toContain('Quero passear também')
    expect(setup({ ...base, client_profile: { id: 1 }, provider_profile: { id: 2 } }).text()).not.toContain('Quero passear também')
    expect(setup({ ...base, provider_profile: { id: 2 } }).text()).not.toContain('Quero passear também')
  })

  it('cria o perfil com o mesmo payload do cadastro, atualiza usuário e mostra ModeSwitch', async () => {
    const w = setup({ ...base, client_profile: { id: 1 } })
    const spy = vi.spyOn(providers, 'createProvider').mockResolvedValue(true)
    await button(w, 'Quero passear também').trigger('click')
    await w.find('[data-test="pick"]').trigger('click')
    await w.findAll('button').find((b) => b.text() === 'Passeio').trigger('click')
    await w.find('input[type="number"]').setValue('30')
    await button(w, 'Criar perfil de passeador').trigger('click')
    await flushPromises()

    const form = { latitude: '-23.5', longitude: '-46.6', service_type: 1, price_per_hour: 30, price_per_day: '', description: '' }
    expect(spy).toHaveBeenCalledWith(buildProviderPayload(form), expect.objectContaining({ onError: expect.any(Function) }))
    expect(auth.fetchUser).toHaveBeenCalled()
    expect(notify.success).toHaveBeenCalledWith('Perfil de passeador criado')
    expect(w.find('[data-test="sheet"]').exists()).toBe(false)
    expect(w.text()).toContain('Modo de uso')
    expect(w.text()).not.toContain('Quero passear também')
  })

  it('valida antes de enviar e mostra erros por campo do backend', async () => {
    const w = setup({ ...base, client_profile: { id: 1 } })
    const spy = vi.spyOn(providers, 'createProvider').mockImplementation(async (_d, { onError }) => {
      onError({ response: { data: { description: ['Texto inválido'] } } })
      return false
    })
    await button(w, 'Quero passear também').trigger('click')
    await button(w, 'Criar perfil de passeador').trigger('click')
    expect(spy).not.toHaveBeenCalled()
    expect(w.text()).toContain('Marque no mapa onde você atende.')

    await w.find('[data-test="pick"]').trigger('click')
    await w.findAll('button').find((b) => b.text() === 'Passeio').trigger('click')
    await w.find('input[type="number"]').setValue('30')
    await button(w, 'Criar perfil de passeador').trigger('click')
    await flushPromises()
    expect(spy).toHaveBeenCalled()
    expect(w.text()).toContain('Texto inválido')
    expect(auth.fetchUser).not.toHaveBeenCalled()
  })
})
