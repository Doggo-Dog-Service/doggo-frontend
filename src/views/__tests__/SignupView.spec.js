import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

vi.mock('@/utils/notify', () => ({
  default: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}))
vi.mock('@/services/authService', async (importOriginal) => ({
  ...(await importOriginal()),
  getMe: vi.fn(),
}))

import SignupView from '../SignupView.vue'
import { createGuard } from '@/router/index'
import { useAuthStore } from '@/stores/auth'
import { useServiceTypeStore } from '@/stores/serviceType'
import { useSignupWizard } from '@/composables/useSignupWizard'
import * as authService from '@/services/authService'

const PendingStub = { template: '<i />' }
let auth, router

async function setup(url, user, { pending = false } = {}) {
  setActivePinia(createPinia())
  auth = useAuthStore()
  useServiceTypeStore().getTypeServices = vi.fn()
  localStorage.clear()
  useSignupWizard().reset()
  if (pending) localStorage.setItem('doggo-signup-pending', JSON.stringify({ provider: true, userId: user.id }))
  if (user) {
    localStorage.setItem('access_token', 'tok')
    auth.user = user
    authService.getMe.mockResolvedValue(user)
  }
  router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home-view', component: PendingStub, meta: { requiresAuth: true, mode: 'client' } },
      { path: '/auth/login', name: 'login-view', component: PendingStub },
      { path: '/auth/cadastro', name: 'signup-view', component: SignupView },
    ],
  })
  router.beforeEach((to) => createGuard(auth)(to))
  router.push(url)
  await router.isReady()
  const wrapper = mount(SignupView, {
    attachTo: document.body,
    global: {
      plugins: [router],
      stubs: { ProviderLocationPicker: PendingStub, RouterLink: { template: '<a><slot /></a>' } },
    },
  })
  await flushPromises()
  return wrapper
}

const button = (w, text) => w.findAll('button').find((b) => b.text().includes(text))

beforeEach(() => vi.clearAllMocks())

describe('SignupView', () => {
  it('visitante nao ve o botao Sair', async () => {
    const w = await setup('/auth/cadastro?etapa=1')
    expect(button(w, 'Sair')).toBeUndefined()
    w.unmount()
  })

  it('Sair na etapa 3 encerra a sessao e cai no login sem voltar', async () => {
    const w = await setup('/auth/cadastro?etapa=3', { id: 7, client_profile: null, provider_profile: null })
    expect(router.currentRoute.value.query.etapa).toBe('3')
    await button(w, 'Sair').trigger('click')
    await flushPromises()
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('access_token')).toBeNull()
    expect(router.currentRoute.value.name).toBe('login-view')
    w.unmount()
  })

  it('Concluir depois so aparece para tutor que adiou o perfil de passeador', async () => {
    const w = await setup('/auth/cadastro?etapa=3', { id: 7, client_profile: null, provider_profile: null })
    expect(button(w, 'Concluir depois')).toBeUndefined()
    w.unmount()
  })

  it('Concluir depois limpa a pendencia e o guard deixa seguir para a home', async () => {
    const user = { id: 7, full_name: 'Ana', client_profile: { id: 1 }, provider_profile: null }
    const w = await setup('/auth/cadastro?etapa=5', user, { pending: true })
    expect(router.currentRoute.value.query.etapa).toBe('5')
    await button(w, 'Concluir depois').trigger('click')
    await flushPromises()
    expect(localStorage.getItem('doggo-signup-pending')).toBeNull()
    expect(router.currentRoute.value.name).toBe('home-view')
    await router.push('/auth/cadastro?etapa=5')
    expect(router.currentRoute.value.name).toBe('home-view')
    w.unmount()
  })

  it('mudar de etapa move o foco para o titulo', async () => {
    const w = await setup('/auth/cadastro?etapa=1')
    const wizard = useSignupWizard()
    Object.assign(wizard.account, { email: 'ana@doggo.com', password: 'senha1234', confirmPassword: 'senha1234' })
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(w.find('h1').text()).toBe('Seus dados')
    expect(document.activeElement).toBe(w.find('h1').element)
    w.unmount()
  })
})
