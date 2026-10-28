import { computed, reactive, toRef } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { useMedia } from '@/composables/useMedia'
import { onlyDigits } from '@/utils/masks'
import { parseFieldErrors } from '@/utils/errors'
import notify from '@/utils/notify'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ACCOUNT_FIELDS = ['email', 'password']
const REGISTER_FIELDS = ['email', 'password', 'full_name', 'cpf', 'phone']

const initialState = () => ({
  step: 1,
  account: { email: '', password: '', confirmPassword: '' },
  personal: { full_name: '', cpf: '', phone: '', photo: null },
  roles: { client: false, provider: false },
  pet: {},
  provider: {},
  errors: {},
  submitting: false,
  userId: null,
  registered: false, // POST /register/ já feito
  loggedIn: false,
  photoDone: false,
  clientCreated: false,
  done: {}, // etapas concluídas: { 1: true, ... }
})

// Estado em módulo: sobrevive à troca de componentes de etapa e é limpo por reset().
const state = reactive(initialState())

export function useSignupWizard() {
  const authStore = useAuthStore()
  const clientStore = useClientStore()
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
    if (state.roles.client && !state.clientCreated) {
      const ok = await clientStore.createClient()
      if (!ok) return false
      state.clientCreated = true
    }
    return advance()
  }

  // TODO(Task 3): etapas 'pet' (POST /pets/) e 'provider' (POST /providers/) ainda não gravam nada.
  function submitProfileStep() {
    return advance()
  }

  async function next() {
    if (state.submitting) return false
    state.submitting = true
    try {
      clearErrors()
      if (state.step === 1) return submitAccount()
      if (state.step === 2) return await submitPersonal()
      if (state.step === 3) return await submitRoles()
      return submitProfileStep()
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
    back,
    reset,
  }
}
