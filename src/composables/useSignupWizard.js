import { computed, reactive, toRef } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { usePetStore } from '@/stores/pet'
import { useProviderStore } from '@/stores/provider'
import { useMedia } from '@/composables/useMedia'
import { onlyDigits } from '@/utils/masks'
import { parseFieldErrors } from '@/utils/errors'
import notify from '@/utils/notify'
import { homeRouteFor } from '@/router/navigation'
import { clearSignupPending, hasPendingProvider, setProviderPending } from '@/utils/signupPending'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ACCOUNT_FIELDS = ['email', 'password']
const REGISTER_FIELDS = ['email', 'password', 'full_name', 'cpf', 'phone']

const initialState = () => ({
  step: 1,
  account: { email: '', password: '', confirmPassword: '' },
  personal: { full_name: '', cpf: '', phone: '', photo: null },
  roles: { client: false, provider: false },
  pet: { name: '', breed: '', size: '', weight: '', photo: null },
  provider: { latitude: null, longitude: null, service_type: null, price_per_hour: '', price_per_day: '', description: '' },
  errors: {},
  submitting: false,
  userId: null,
  registered: false, // POST /register/ já feito
  loggedIn: false,
  photoDone: false,
  clientCreated: false,
  petCreated: false,
  done: {}, // etapas concluídas: { 1: true, ... }
})

// Estado em módulo: sobrevive à troca de componentes de etapa e é limpo por reset().
const state = reactive(initialState())

export function useSignupWizard() {
  const authStore = useAuthStore()
  const clientStore = useClientStore()
  const petStore = usePetStore()
  const providerStore = useProviderStore()
  const { postImage } = useMedia()

  // 1..3 fixos; depois 'pet' (tutor) e 'provider' (passeador).
  const stepOrder = computed(() => [
    1,
    2,
    3,
    ...(state.roles.client ? ['pet'] : []),
    ...(state.roles.provider ? ['provider'] : []),
  ])
  const totalSteps = computed(() => Math.max(4, stepOrder.value.length))
  const stepKey = computed(() => stepOrder.value[state.step - 1] ?? null)
  const isLastStep = computed(() => state.step >= 4 && state.step >= stepOrder.value.length)

  function clearErrors() {
    for (const key of Object.keys(state.errors)) delete state.errors[key]
  }

  function canEnter(step) {
    if (!Number.isInteger(step) || step < 1) return false
    const hasAccount = state.registered || !!authStore.user
    if (step === 1) return !hasAccount
    if (step === 2) return !hasAccount && !!state.done[1]
    if (step === 3) return hasAccount
    return !!state.done[3] && step <= stepOrder.value.length
  }

  // Maior etapa permitida até a pedida (a URL pode apontar para uma etapa inalcançável).
  function resolveStep(requested) {
    for (let n = Math.min(requested, 5); n >= 1; n--) {
      if (canEnter(n)) return n
    }
    // Nada abaixo: a conta já existe e as etapas iniciais fecharam; vai para a primeira aberta.
    for (let n = 1; n <= 5; n++) {
      if (canEnter(n)) return n
    }
    return 1
  }

  function goTo(step) {
    if (!canEnter(step)) return false
    state.step = step
    return true
  }

  function back() {
    return goTo(state.step - 1)
  }

  function reset() {
    clearSignupPending()
    // Mutação in-place: as referências devolvidas por useSignupWizard() continuam válidas.
    for (const [key, value] of Object.entries(initialState())) {
      if (value && typeof value === 'object') {
        for (const k of Object.keys(state[key])) delete state[key][k]
        Object.assign(state[key], value)
      } else {
        state[key] = value
      }
    }
  }

  // Logout/troca de conta na mesma sessão deixa registered/loggedIn velhos no módulo.
  function resetIfSessionLost() {
    if (!authStore.user && (state.registered || state.loggedIn)) reset()
  }

  function advance() {
    state.done[state.step] = true
    if (!isLastStep.value) state.step += 1
    return true
  }

  // --- etapas ---

  function submitAccount() {
    const { email, password, confirmPassword } = state.account
    if (!EMAIL_RE.test(email.trim())) state.errors.email = 'Informe um email válido.'
    if (password.length < 8) state.errors.password = 'A senha precisa ter ao menos 8 caracteres.'
    else if (password !== confirmPassword) state.errors.confirmPassword = 'As senhas não coincidem.'
    if (Object.keys(state.errors).length) return false
    return advance()
  }

  function handleRegisterError(error) {
    const fields = parseFieldErrors(error?.fields)
    const known = REGISTER_FIELDS.filter((field) => fields[field])
    if (!known.length) {
      notify.error(error?.message)
      return
    }
    for (const field of known) state.errors[field] = fields[field]
    if (known.some((field) => ACCOUNT_FIELDS.includes(field))) state.step = 1
  }

  async function savePhoto(userId) {
    const image = await postImage({ file: state.personal.photo, description: state.account.email })
    if (!image?.attachment_key) {
      notify.error('Não foi possível enviar a foto de perfil. Você poderá adicioná-la depois.')
      return
    }
    const updated = await authStore.updateUser(userId, { profile_picture_attachment_key: image.attachment_key })
    if (updated) state.photoDone = true
  }

  async function submitPersonal() {
    const { full_name, cpf, phone } = state.personal
    if (!full_name.trim()) state.errors.full_name = 'Informe seu nome completo.'
    if (onlyDigits(cpf).length !== 11) state.errors.cpf = 'Informe os 11 dígitos do CPF.'
    if (phone && ![10, 11].includes(onlyDigits(phone).length)) state.errors.phone = 'Informe DDD e número.'
    if (Object.keys(state.errors).length) return false

    if (!state.registered) {
      const user = await authStore.createUser(
        {
          email: state.account.email.trim(),
          password: state.account.password,
          full_name: full_name.trim(),
          cpf: onlyDigits(cpf),
          phone: onlyDigits(phone),
        },
        { onError: handleRegisterError },
      )
      if (!user) return false
      state.registered = true
      state.userId = user.id
    }

    if (!state.loggedIn) {
      const ok = await authStore.login({ email: state.account.email.trim(), password: state.account.password })
      if (!ok) return false
      state.loggedIn = true
    }

    // O upload exige login; falha na foto não bloqueia o cadastro.
    if (state.personal.photo && !state.photoDone) await savePhoto(state.userId)

    await authStore.fetchUser()
    return advance()
  }

  async function submitRoles() {
    if (!state.roles.client && !state.roles.provider) {
      state.errors.roles = 'Escolha ao menos uma opção para continuar.'
      return false
    }
    if (state.roles.provider) setProviderPending()
    else clearSignupPending()
    if (state.roles.client && !state.clientCreated) {
      const ok = await clientStore.createClient()
      if (!ok) return false
      state.clientCreated = true
    }
    return advance()
  }

  async function submitPet() {
    const { name, breed, size, weight, photo } = state.pet
    if (!name.trim()) state.errors.name = 'Informe o nome do seu pet.'
    if (!size) state.errors.size = 'Escolha o porte.'
    if (Object.keys(state.errors).length) return false

    if (!state.petCreated) {
      const payload = { name: name.trim(), breed: breed.trim(), size }
      if (String(weight).trim() !== '') payload.weight = Number(weight)
      if (photo) {
        const image = await postImage({ file: photo, description: name.trim() })
        if (!image?.attachment_key) return false
        payload.pet_picture = image.attachment_key
      }
      const created = await petStore.createPet(payload)
      if (!created) return false
      state.petCreated = true
    }
    return advance()
  }

  async function submitProvider() {
    const { latitude, longitude, service_type, price_per_hour, price_per_day, description } = state.provider
    const filled = (value) => String(value ?? '').trim() !== ''
    if (!filled(latitude) || !filled(longitude) || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
      state.errors.location = 'Marque no mapa onde você atende.'
    }
    if (!service_type) state.errors.service_type = 'Escolha o tipo de serviço.'
    if (!filled(price_per_hour) && !filled(price_per_day)) {
      state.errors.price = 'Informe o preço por hora ou por dia.'
    }
    if (Object.keys(state.errors).length) return false

    const payload = {
      fixed_latitude: Number(latitude).toFixed(6),
      fixed_longitude: Number(longitude).toFixed(6),
      service_type,
    }
    if (filled(price_per_hour)) payload.price_per_hour = price_per_hour
    if (filled(price_per_day)) payload.price_per_day = price_per_day
    if (description.trim()) payload.description = description.trim()

    const ok = await providerStore.createProvider(payload)
    if (!ok) return false
    clearSignupPending()
    return advance()
  }

  // "Pular por agora" só existe na etapa do pet.
  function skip() {
    if (stepKey.value !== 'pet') return false
    return advance()
  }

  // Tutor que já tem perfil de cliente e ainda deve criar o de passeador (após recarregar a página).
  function resumePending() {
    if (state.done[3] || !hasPendingProvider(authStore.user)) return false
    state.roles.client = true
    state.roles.provider = true
    state.clientCreated = true
    state.done[1] = state.done[2] = state.done[3] = true
    state.step = 5
    return true
  }

  // Só aqui o perfil é carregado: antes disso mode fica null e o guard mantém o usuário no cadastro.
  async function complete() {
    await authStore.fetchUser()
    const to = homeRouteFor(authStore.mode)
    reset()
    notify.success('Cadastro concluído')
    return to
  }

  async function next() {
    if (state.submitting) return false
    state.submitting = true
    try {
      clearErrors()
      if (state.step === 1) return submitAccount()
      if (state.step === 2) return await submitPersonal()
      if (state.step === 3) return await submitRoles()
      return stepKey.value === 'pet' ? await submitPet() : await submitProvider()
    } finally {
      state.submitting = false
    }
  }

  return {
    step: toRef(state, 'step'),
    submitting: toRef(state, 'submitting'),
    account: state.account,
    personal: state.personal,
    roles: state.roles,
    pet: state.pet,
    provider: state.provider,
    errors: state.errors,
    stepOrder,
    stepKey,
    totalSteps,
    isLastStep,
    canEnter,
    resolveStep,
    goTo,
    next,
    skip,
    complete,
    resumePending,
    back,
    reset,
    resetIfSessionLost,
  }
}
