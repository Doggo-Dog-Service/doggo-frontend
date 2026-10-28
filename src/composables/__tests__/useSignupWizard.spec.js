import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: { user: null, createUser: vi.fn(), login: vi.fn(), fetchUser: vi.fn(), updateUser: vi.fn() },
  clients: { createClient: vi.fn() },
  postImage: vi.fn(),
  notify: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/stores/clients', () => ({ useClientStore: () => mocks.clients }))
vi.mock('@/composables/useMedia', () => ({ useMedia: () => ({ postImage: mocks.postImage }) }))
vi.mock('@/utils/notify', () => ({ default: mocks.notify }))

import { useSignupWizard } from '../useSignupWizard'

function fillAccount(w) {
  Object.assign(w.account, { email: 'ana@doggo.com', password: 'senha1234', confirmPassword: 'senha1234' })
}
function fillPersonal(w) {
  Object.assign(w.personal, { full_name: 'Ana Souza', cpf: '529.982.247-25', phone: '(11) 91234-5678' })
}

describe('useSignupWizard', () => {
  let w
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.user = null
    mocks.auth.createUser.mockResolvedValue({ id: 7 })
    mocks.auth.login.mockResolvedValue(true)
    mocks.auth.fetchUser.mockResolvedValue()
    mocks.auth.updateUser.mockResolvedValue({ id: 7 })
    mocks.clients.createClient.mockResolvedValue(true)
    mocks.postImage.mockResolvedValue({ attachment_key: 'abc' })
    w = useSignupWizard()
    w.reset()
  })

  describe('etapa 1', () => {
    it('bloqueia email invalido', async () => {
      fillAccount(w)
      w.account.email = 'sem-arroba'
      expect(await w.next()).toBe(false)
      expect(w.errors.email).toBeTruthy()
      expect(w.step.value).toBe(1)
    })

    it('bloqueia senha curta', async () => {
      fillAccount(w)
      w.account.password = w.account.confirmPassword = '1234567'
      expect(await w.next()).toBe(false)
      expect(w.errors.password).toBeTruthy()
    })

    it('bloqueia confirmacao diferente', async () => {
      fillAccount(w)
      w.account.confirmPassword = 'outra-senha'
      expect(await w.next()).toBe(false)
      expect(w.errors.confirmPassword).toBeTruthy()
    })

    it('avanca com dados validos', async () => {
      fillAccount(w)
      expect(await w.next()).toBe(true)
      expect(w.step.value).toBe(2)
      expect(mocks.auth.createUser).not.toHaveBeenCalled()
    })
  })

  describe('etapa 2', () => {
    beforeEach(async () => {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
    })

    it('registra, loga e busca o usuario na ordem, sem foto', async () => {
      const order = []
      mocks.auth.createUser.mockImplementation(async () => (order.push('create'), { id: 7 }))
      mocks.auth.login.mockImplementation(async () => (order.push('login'), true))
      mocks.auth.fetchUser.mockImplementation(async () => order.push('fetch'))
      expect(await w.next()).toBe(true)
      expect(order).toEqual(['create', 'login', 'fetch'])
      expect(mocks.auth.createUser).toHaveBeenCalledWith(
        { email: 'ana@doggo.com', password: 'senha1234', full_name: 'Ana Souza', cpf: '52998224725', phone: '11912345678' },
        expect.any(Object),
      )
      expect(mocks.auth.login).toHaveBeenCalledWith({ email: 'ana@doggo.com', password: 'senha1234' })
      expect(mocks.postImage).not.toHaveBeenCalled()
      expect(w.step.value).toBe(3)
    })

    it('com foto envia imagem e atualiza o usuario antes do fetchUser', async () => {
      const order = []
      w.personal.photo = new File(['x'], 'a.png')
      mocks.postImage.mockImplementation(async () => (order.push('image'), { attachment_key: 'k1' }))
      mocks.auth.updateUser.mockImplementation(async () => (order.push('update'), { id: 7 }))
      mocks.auth.fetchUser.mockImplementation(async () => order.push('fetch'))
      expect(await w.next()).toBe(true)
      expect(order).toEqual(['image', 'update', 'fetch'])
      expect(mocks.auth.updateUser).toHaveBeenCalledWith(7, { profile_picture_attachment_key: 'k1' })
    })

    it('falha na foto nao impede avancar', async () => {
      w.personal.photo = new File(['x'], 'a.png')
      mocks.postImage.mockResolvedValue(undefined)
      expect(await w.next()).toBe(true)
      expect(w.step.value).toBe(3)
      expect(mocks.notify.error).toHaveBeenCalled()
      expect(mocks.auth.updateUser).not.toHaveBeenCalled()
    })

    it('erro de email volta para a etapa 1 com errors.email', async () => {
      mocks.auth.createUser.mockImplementation(async (_, { onError }) => {
        onError({ message: 'x', fields: { email: ['User with this email already exists.'] } })
        return null
      })
      expect(await w.next()).toBe(false)
      expect(w.step.value).toBe(1)
      expect(w.errors.email).toBe('Já existe um usuário com este email.')
      expect(mocks.auth.login).not.toHaveBeenCalled()
    })

    it('erro de cpf fica na etapa 2 com errors.cpf', async () => {
      mocks.auth.createUser.mockImplementation(async (_, { onError }) => {
        onError({ message: 'x', fields: { cpf: ['CPF inválido.'] } })
        return null
      })
      expect(await w.next()).toBe(false)
      expect(w.step.value).toBe(2)
      expect(w.errors.cpf).toBe('CPF inválido.')
    })

    it('erro sem campo conhecido mostra toast e fica na etapa', async () => {
      mocks.auth.createUser.mockImplementation(async (_, { onError }) => {
        onError({ message: 'Servidor fora do ar.', fields: null })
        return null
      })
      expect(await w.next()).toBe(false)
      expect(w.step.value).toBe(2)
      expect(mocks.notify.error).toHaveBeenCalledWith('Servidor fora do ar.')
    })

    it('valida nome e cpf antes de chamar a API', async () => {
      w.personal.cpf = '123'
      w.personal.full_name = ''
      expect(await w.next()).toBe(false)
      expect(w.errors.cpf).toBeTruthy()
      expect(w.errors.full_name).toBeTruthy()
      expect(mocks.auth.createUser).not.toHaveBeenCalled()
    })

    it('nova tentativa apos falha no login nao recria o usuario', async () => {
      mocks.auth.login.mockResolvedValueOnce(false)
      expect(await w.next()).toBe(false)
      expect(await w.next()).toBe(true)
      expect(mocks.auth.createUser).toHaveBeenCalledTimes(1)
      expect(mocks.auth.login).toHaveBeenCalledTimes(2)
    })
  })

  describe('etapa 3', () => {
    beforeEach(async () => {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      await w.next()
    })

    it('exige ao menos um papel', async () => {
      expect(await w.next()).toBe(false)
      expect(w.errors.roles).toBeTruthy()
      expect(mocks.clients.createClient).not.toHaveBeenCalled()
    })

    it('com client chama createClient uma vez, mesmo repetindo', async () => {
      w.roles.client = true
      expect(await w.next()).toBe(true)
      expect(mocks.clients.createClient).toHaveBeenCalledTimes(1)
      expect(w.step.value).toBe(4)
      w.goTo(3)
      await w.next()
      expect(mocks.clients.createClient).toHaveBeenCalledTimes(1)
    })

    it('next concorrente dispara uma chamada', async () => {
      w.roles.client = true
      const [a, b] = await Promise.all([w.next(), w.next()])
      expect([a, b]).toEqual([true, false])
      expect(mocks.clients.createClient).toHaveBeenCalledTimes(1)
    })

    it('so passeador nao cria cliente e vai para a etapa 4', async () => {
      w.roles.provider = true
      expect(await w.next()).toBe(true)
      expect(mocks.clients.createClient).not.toHaveBeenCalled()
      expect(w.step.value).toBe(4)
    })

    it('falha no createClient mantem a etapa', async () => {
      w.roles.client = true
      mocks.clients.createClient.mockResolvedValue(false)
      expect(await w.next()).toBe(false)
      expect(w.step.value).toBe(3)
    })

    it('totalSteps conta os papeis (minimo 4)', () => {
      expect(w.totalSteps.value).toBe(4)
      w.roles.client = true
      expect(w.totalSteps.value).toBe(4)
      w.roles.provider = true
      expect(w.totalSteps.value).toBe(5)
    })

    it('stepKey: pet para tutor, provider para passeador', async () => {
      w.roles.client = w.roles.provider = true
      await w.next()
      expect(w.stepKey.value).toBe('pet')
      w.step.value = 5
      expect(w.stepKey.value).toBe('provider')
    })
  })

  describe('resetIfSessionLost', () => {
    it('estado antigo (conta criada) sem sessao volta limpo para a etapa 1', async () => {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      await w.next()
      expect(w.step.value).toBe(3)
      mocks.auth.user = null // logout / troca de conta
      w.resetIfSessionLost()
      expect(w.step.value).toBe(1)
      expect(w.account.email).toBe('')
      expect(w.canEnter(3)).toBe(false)
    })

    it('com sessao ativa preserva o estado', async () => {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      await w.next()
      mocks.auth.user = { id: 7 }
      w.resetIfSessionLost()
      expect(w.step.value).toBe(3)
    })

    it('visitante no meio da etapa 1 nao perde o que digitou', () => {
      fillAccount(w)
      w.resetIfSessionLost()
      expect(w.account.email).toBe('ana@doggo.com')
    })
  })

  describe('canEnter', () => {
    it('4 e falso sem a etapa 3 concluida', async () => {
      expect(w.canEnter(4)).toBe(false)
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      await w.next()
      expect(w.canEnter(4)).toBe(false)
      w.roles.client = true
      await w.next()
      expect(w.canEnter(4)).toBe(true)
    })

    it('1 abre sem login; 2 e 3 exigem etapas anteriores', () => {
      expect(w.canEnter(1)).toBe(true)
      expect(w.canEnter(2)).toBe(false)
      expect(w.canEnter(3)).toBe(false)
    })

    it('usuario autenticado sem perfil retoma na etapa 3', () => {
      mocks.auth.user = { id: 7 }
      expect(w.canEnter(3)).toBe(true)
      expect(w.canEnter(1)).toBe(false)
      expect(w.resolveStep(4)).toBe(3)
      expect(w.resolveStep(1)).toBe(3)
    })

    it('resolveStep devolve a etapa 1 para visitante', () => {
      expect(w.resolveStep(3)).toBe(1)
      expect(w.resolveStep(1)).toBe(1)
    })
  })
})
