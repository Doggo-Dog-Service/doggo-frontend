import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  auth: { user: null, createUser: vi.fn(), login: vi.fn(), fetchUser: vi.fn(), updateUser: vi.fn() },
  clients: { createClient: vi.fn() },
  postImage: vi.fn(),
  sendDocument: vi.fn(),
  pets: { createPet: vi.fn() },
  providers: { createProvider: vi.fn() },
  notify: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('@/stores/auth', () => ({ useAuthStore: () => mocks.auth }))
vi.mock('@/stores/clients', () => ({ useClientStore: () => mocks.clients }))
vi.mock('@/stores/pet', () => ({ usePetStore: () => mocks.pets }))
vi.mock('@/stores/provider', () => ({ useProviderStore: () => mocks.providers }))
vi.mock('@/composables/useMedia', () => ({ useMedia: () => ({ postImage: mocks.postImage }) }))
vi.mock('@/utils/notify', () => ({ default: mocks.notify }))
vi.mock('@/composables/useProviderDocuments', () => ({
  DOCUMENT_KINDS: [{ kind: 'doc_front' }, { kind: 'doc_back' }],
  useProviderDocuments: () => ({ sendDocument: mocks.sendDocument }),
}))

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
    mocks.auth.mode = 'client'
    localStorage.clear()
    mocks.pets.createPet.mockResolvedValue({ id: 1 })
    mocks.providers.createProvider.mockResolvedValue(true)
    mocks.auth.createUser.mockResolvedValue({ id: 7 })
    mocks.auth.login.mockResolvedValue(true)
    mocks.auth.fetchUser.mockResolvedValue()
    mocks.auth.updateUser.mockResolvedValue({ id: 7 })
    mocks.clients.createClient.mockResolvedValue(true)
    mocks.postImage.mockResolvedValue({ attachment_key: 'abc' })
    mocks.sendDocument.mockResolvedValue(true)
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

    it('campos desconhecidos junto de conhecidos tambem viram toast', async () => {
      mocks.auth.createUser.mockImplementation(async (_, { onError }) => {
        onError({ message: 'x', fields: { cpf: ['CPF inválido.'], address: ['Endereço inválido.'] } })
        return null
      })
      expect(await w.next()).toBe(false)
      expect(w.errors.cpf).toBe('CPF inválido.')
      expect(mocks.notify.error).toHaveBeenCalledWith('Endereço inválido.')
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
      expect(w.totalSteps.value).toBe(6)
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

    it('registro feito mas login falhou, sem usuario: reinicia na etapa 1', async () => {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      mocks.auth.login.mockResolvedValueOnce(false)
      expect(await w.next()).toBe(false)
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

    it('estado de outro usuario (id diferente da sessao) e descartado', async () => {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      await w.next()
      mocks.auth.user = { id: 99 }
      w.resetIfSessionLost()
      expect(w.step.value).toBe(1)
      expect(w.account.email).toBe('')
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

  describe('etapas de pet e passeador', () => {
    async function reachStep3() {
      fillAccount(w)
      await w.next()
      fillPersonal(w)
      await w.next()
    }
    async function reachPet() {
      await reachStep3()
      w.roles.client = true
      await w.next()
    }
    async function reachProvider({ withClient = false } = {}) {
      await reachStep3()
      w.roles.provider = true
      if (withClient) w.roles.client = true
      await w.next()
      if (withClient) {
        w.pet.name = 'Rex'
        w.pet.size = 'm'
        await w.next()
      }
    }
    function fillProvider() {
      Object.assign(w.provider, {
        latitude: -23.5505,
        longitude: -46.6333,
        service_type: 2,
        price_per_hour: '25',
        price_per_day: '',
        description: 'Passeios longos',
      })
    }

    it('pet: pular avanca sem chamar a store', async () => {
      await reachStep3()
      w.roles.client = w.roles.provider = true
      await w.next()
      expect(w.skip()).toBe(true)
      expect(mocks.pets.createPet).not.toHaveBeenCalled()
      expect(w.step.value).toBe(5)
    })

    it('pet: exige nome e porte', async () => {
      await reachPet()
      expect(await w.next()).toBe(false)
      expect(w.errors.name).toBeTruthy()
      expect(w.errors.size).toBeTruthy()
      expect(mocks.pets.createPet).not.toHaveBeenCalled()
    })

    it('pet: salva com o mesmo payload do PetAddModal', async () => {
      await reachPet()
      Object.assign(w.pet, { name: ' Rex ', breed: 'Vira-lata', size: 'm', weight: '12' })
      expect(await w.next()).toBe(true)
      expect(mocks.pets.createPet).toHaveBeenCalledWith({ name: 'Rex', breed: 'Vira-lata', size: 'm', weight: 12 })
    })

    it('pet: envia foto antes e inclui pet_picture', async () => {
      await reachPet()
      Object.assign(w.pet, { name: 'Rex', size: 'p', photo: new File(['x'], 'p.png') })
      mocks.postImage.mockResolvedValue({ attachment_key: 'pk' })
      await w.next()
      expect(mocks.pets.createPet).toHaveBeenCalledWith({ name: 'Rex', breed: '', size: 'p', pet_picture: 'pk' })
    })

    it.each(['0', '-1', '100', '150', 'abc'])('pet: peso %s e rejeitado', async (weight) => {
      await reachPet()
      Object.assign(w.pet, { name: 'Rex', size: 'p', weight })
      expect(await w.next()).toBe(false)
      expect(w.errors.weight).toBeTruthy()
      expect(mocks.pets.createPet).not.toHaveBeenCalled()
    })

    it('pet: peso arredonda para 3 casas', async () => {
      await reachPet()
      Object.assign(w.pet, { name: 'Rex', size: 'p', weight: '12.34567' })
      expect(await w.next()).toBe(true)
      expect(mocks.pets.createPet).toHaveBeenCalledWith({ name: 'Rex', breed: '', size: 'p', weight: 12.346 })
    })

    it('pet: repetir apos falha do createPet nao reenvia a foto', async () => {
      await reachPet()
      Object.assign(w.pet, { name: 'Rex', size: 'p', photo: new File(['x'], 'p.png') })
      mocks.postImage.mockResolvedValue({ attachment_key: 'pk' })
      mocks.pets.createPet.mockResolvedValueOnce(null)
      expect(await w.next()).toBe(false)
      expect(await w.next()).toBe(true)
      expect(mocks.postImage).toHaveBeenCalledTimes(1)
      expect(mocks.pets.createPet).toHaveBeenLastCalledWith({ name: 'Rex', breed: '', size: 'p', pet_picture: 'pk' })
    })

    it('pet: trocar a foto depois da falha envia a nova', async () => {
      await reachPet()
      Object.assign(w.pet, { name: 'Rex', size: 'p', photo: new File(['x'], 'p.png') })
      mocks.postImage.mockResolvedValueOnce({ attachment_key: 'k1' }).mockResolvedValueOnce({ attachment_key: 'k2' })
      mocks.pets.createPet.mockResolvedValueOnce(null)
      await w.next()
      w.pet.photo = new File(['y'], 'q.png')
      await w.next()
      expect(mocks.postImage).toHaveBeenCalledTimes(2)
      expect(mocks.pets.createPet).toHaveBeenLastCalledWith({ name: 'Rex', breed: '', size: 'p', pet_picture: 'k2' })
    })

    it('pet: falha na store mantem a etapa e permite repetir', async () => {
      await reachPet()
      Object.assign(w.pet, { name: 'Rex', size: 'p' })
      mocks.pets.createPet.mockResolvedValueOnce(null)
      expect(await w.next()).toBe(false)
      expect(w.step.value).toBe(4)
      expect(await w.next()).toBe(true)
      expect(mocks.pets.createPet).toHaveBeenCalledTimes(2)
    })

    it('passeador: exige coordenadas, tipo e um preco', async () => {
      await reachProvider()
      expect(await w.next()).toBe(false)
      expect(w.errors.location).toBeTruthy()
      expect(w.errors.service_type).toBeTruthy()
      expect(w.errors.price).toBeTruthy()
      expect(mocks.providers.createProvider).not.toHaveBeenCalled()
    })

    it.each([
      ['0', ''],
      ['-5', ''],
      ['abc', ''],
      ['25', '0'],
      ['', '-1'],
    ])('passeador: preco hora=%s dia=%s e rejeitado', async (hour, day) => {
      await reachProvider()
      fillProvider()
      Object.assign(w.provider, { price_per_hour: hour, price_per_day: day })
      expect(await w.next()).toBe(false)
      expect(w.errors.price).toBe('O preço precisa ser maior que zero.')
      expect(mocks.providers.createProvider).not.toHaveBeenCalled()
    })

    it('passeador: chama createProvider com 6 casas', async () => {
      await reachProvider()
      fillProvider()
      expect(await w.next()).toBe(true)
      expect(mocks.providers.createProvider).toHaveBeenCalledWith({
        fixed_latitude: '-23.550500',
        fixed_longitude: '-46.633300',
        service_type: 2,
        price_per_hour: '25',
        description: 'Passeios longos',
      }, expect.any(Object))
    })

    it('passeador: createProvider falso mantem a etapa e a pendencia', async () => {
      await reachProvider()
      fillProvider()
      mocks.providers.createProvider.mockResolvedValue(false)
      expect(await w.next()).toBe(false)
      expect(localStorage.getItem('doggo-signup-pending')).toBeTruthy()
    })

    it('passeador: erro da API cai no campo, avisa e fica na etapa', async () => {
      await reachProvider()
      fillProvider()
      mocks.providers.createProvider.mockImplementation(async (_, { onError }) => {
        onError({ response: { status: 400, data: { price_per_hour: ['A valid number is required.'], fixed_latitude: ['Invalid.'] } } })
        return false
      })
      expect(await w.next()).toBe(false)
      expect(w.step.value).toBe(4)
      expect(w.errors.price).toBe('Informe um número válido.')
      expect(w.errors.location).toBe('Invalid.')
      expect(mocks.notify.error).toHaveBeenCalled()
    })

    describe('documentos', () => {
      const file = () => new File(['x'], 'doc.png')
      async function reachDocuments() {
        await reachProvider()
        fillProvider()
        await w.next()
      }

      it('vem depois do perfil de passeador e e a ultima etapa', async () => {
        await reachDocuments()
        expect(w.step.value).toBe(5)
        expect(w.stepKey.value).toBe('documents')
        expect(w.isLastStep.value).toBe(true)
      })

      it('passeador e tutor: documentos e a etapa 6', async () => {
        await reachProvider({ withClient: true })
        fillProvider()
        await w.next()
        expect(w.step.value).toBe(6)
        expect(w.stepKey.value).toBe('documents')
        expect(w.resolveStep(6)).toBe(6)
      })

      it('sem arquivos, continuar nao envia nada e conclui', async () => {
        await reachDocuments()
        expect(await w.next()).toBe(true)
        expect(mocks.sendDocument).not.toHaveBeenCalled()
      })

      it('enviar depois pula a etapa', async () => {
        await reachDocuments()
        expect(w.skip()).toBe(true)
        expect(mocks.sendDocument).not.toHaveBeenCalled()
      })

      it('envia frente e verso escolhidos', async () => {
        await reachDocuments()
        const front = file()
        const back = file()
        w.documents.doc_front = front
        w.documents.doc_back = back
        expect(await w.next()).toBe(true)
        expect(mocks.sendDocument).toHaveBeenCalledWith('doc_front', front)
        expect(mocks.sendDocument).toHaveBeenCalledWith('doc_back', back)
      })

      it('falha mantem a etapa e nao reenvia o que ja foi', async () => {
        await reachDocuments()
        w.documents.doc_front = file()
        w.documents.doc_back = file()
        mocks.sendDocument.mockImplementation(async (kind) => kind === 'doc_front')
        expect(await w.next()).toBe(false)
        expect(w.step.value).toBe(5)
        mocks.sendDocument.mockClear()
        mocks.sendDocument.mockResolvedValue(true)
        expect(await w.next()).toBe(true)
        expect(mocks.sendDocument).toHaveBeenCalledTimes(1)
        expect(mocks.sendDocument).toHaveBeenCalledWith('doc_back', w.documents.doc_back)
      })
    })

    it('ambos os papeis: pet, passeador e conclusao', async () => {
      await reachProvider({ withClient: true })
      expect(w.step.value).toBe(5)
      expect(w.stepKey.value).toBe('provider')
      fillProvider()
      expect(await w.next()).toBe(true)
      mocks.auth.fetchUser.mockClear()
      const to = await w.complete()
      expect(mocks.auth.fetchUser).toHaveBeenCalled()
      expect(mocks.notify.success).toHaveBeenCalledWith('Cadastro concluído')
      expect(to).toEqual({ name: 'home-view' })
    })

    it('so passeador conclui para provider-today-view', async () => {
      mocks.auth.mode = 'provider'
      await reachProvider()
      fillProvider()
      await w.next()
      expect(await w.complete()).toEqual({ name: 'provider-today-view' })
    })

    it('guarda pendencia de passeador e limpa apos criar', async () => {
      await reachProvider({ withClient: true })
      expect(JSON.parse(localStorage.getItem('doggo-signup-pending'))).toEqual({ provider: true, userId: 7 })
      fillProvider()
      await w.next()
      expect(localStorage.getItem('doggo-signup-pending')).toBeNull()
    })

    it('concluir depois: limpa a pendencia e devolve a home sem criar o perfil', async () => {
      localStorage.setItem('doggo-signup-pending', JSON.stringify({ provider: true, userId: 7 }))
      mocks.auth.user = { id: 7, client_profile: { id: 1 }, provider_profile: null }
      w.resumePending()
      const to = await w.skipProvider()
      expect(localStorage.getItem('doggo-signup-pending')).toBeNull()
      expect(mocks.providers.createProvider).not.toHaveBeenCalled()
      expect(to).toEqual({ name: 'home-view' })
    })

    it('reset limpa a pendencia', async () => {
      await reachProvider({ withClient: true })
      w.reset()
      expect(localStorage.getItem('doggo-signup-pending')).toBeNull()
    })

    it('so tutor nunca grava pendencia', async () => {
      await reachPet()
      expect(localStorage.getItem('doggo-signup-pending')).toBeNull()
    })

    it('retomada: tutor com pendencia abre a etapa 5', () => {
      localStorage.setItem('doggo-signup-pending', JSON.stringify({ provider: true, userId: 7 }))
      mocks.auth.user = { id: 7, client_profile: { id: 1 }, provider_profile: null }
      w.resumePending()
      expect(w.roles.client && w.roles.provider).toBe(true)
      expect(w.resolveStep(5)).toBe(5)
      expect(w.stepKey.value).toBe('provider')
    })
  })
})
