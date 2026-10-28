<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppButton from '@/components/buttons/AppButton.vue'
import UiSteps from '@/components/ui/UiSteps.vue'
import SignupStepAccount from '@/components/signup/SignupStepAccount.vue'
import SignupStepPersonal from '@/components/signup/SignupStepPersonal.vue'
import SignupStepRoles from '@/components/signup/SignupStepRoles.vue'
import SignupStepPet from '@/components/signup/SignupStepPet.vue'
import SignupStepProvider from '@/components/signup/SignupStepProvider.vue'
import { useSignupWizard } from '@/composables/useSignupWizard'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const wizard = useSignupWizard()
const authStore = useAuthStore()
const { step, totalSteps, stepKey, isLastStep, submitting } = wizard

const STEPS = {
  1: { title: 'Crie sua conta', subtitle: 'Comece com seu email e uma senha.', component: SignupStepAccount },
  2: { title: 'Seus dados', subtitle: 'Precisamos de alguns dados para criar seu perfil.', component: SignupStepPersonal },
  3: { title: 'Como você vai usar o DOGGO?', subtitle: null, component: SignupStepRoles },
  pet: { title: 'Seu primeiro pet', subtitle: null, component: SignupStepPet },
  provider: { title: 'Seu perfil de passeador', subtitle: null, component: SignupStepProvider },
}

const current = computed(() => STEPS[stepKey.value] ?? STEPS[1])
const canGoBack = computed(() => wizard.canEnter(step.value - 1))
// Tutor que também será passeador pode adiar o perfil de passeador (o de tutor já existe).
const canDefer = computed(() => stepKey.value === 'provider' && wizard.roles.client)
const heading = ref(null)
const continueText = computed(() => (isLastStep.value ? 'Concluir cadastro' : 'Continuar'))

wizard.resetIfSessionLost()
wizard.resumePending()

// URL -> etapa: aponta sempre para a primeira etapa permitida.
watch(
  () => route.query.etapa,
  (raw) => {
    const parsed = Number.parseInt(raw, 10)
    const target = wizard.resolveStep(Number.isInteger(parsed) && parsed >= 1 ? parsed : 1)
    step.value = target
    if (String(target) !== raw) router.replace({ query: { etapa: String(target) } })
  },
  { immediate: true },
)

// Leitores de tela e teclado seguem para o conteúdo da nova etapa.
watch(step, async () => {
  await nextTick()
  heading.value?.focus()
})

// Etapa -> URL (depois de ações que mudam a etapa).
function syncRoute() {
  if (String(step.value) !== route.query.etapa) router.push({ query: { etapa: String(step.value) } })
}

async function complete() {
  router.replace(await wizard.complete())
}

async function onNext() {
  const wasLast = isLastStep.value
  const ok = await wizard.next()
  if (ok && wasLast) return complete()
  syncRoute()
}

async function onDefer() {
  router.replace(await wizard.skipProvider())
}

// Quem criou a conta mas não terminou o cadastro precisa de uma saída.
function onLogout() {
  authStore.logout()
  wizard.reset()
  router.replace({ name: 'login-view' })
}

async function onSkip() {
  const wasLast = isLastStep.value
  wizard.skip()
  if (wasLast) return complete()
  syncRoute()
}

function onBack() {
  if (wizard.back()) syncRoute()
}
</script>

<template>
  <form class="flex flex-col gap-6 pb-24 md:pb-0" novalidate @submit.prevent="onNext">
    <div v-if="authStore.user" class="flex justify-end">
      <button
        type="button"
        class="inline-flex min-h-11 items-center rounded-control px-2 text-body font-semibold text-fg-muted underline-offset-4 hover:text-fg hover:underline focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
        :disabled="submitting"
        @click="onLogout"
      >
        Sair
      </button>
    </div>
    <UiSteps :current="step" :total="totalSteps" aria-label="Progresso do cadastro" />
    <header class="flex flex-col gap-1">
      <h1 ref="heading" tabindex="-1" class="text-title text-fg focus:outline-none">{{ current.title }}</h1>
      <p v-if="current.subtitle" class="text-body text-fg-muted">{{ current.subtitle }}</p>
    </header>

    <component :is="current.component" :key="stepKey" />

    <div
      class="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:z-auto md:border-0 md:bg-transparent md:p-0"
    >
      <AppButton v-if="canGoBack" text="Voltar" variant="secondary" size="lg" :disabled="submitting" @event="onBack" />
      <AppButton
        v-if="canDefer"
        text="Concluir depois"
        variant="secondary"
        size="lg"
        :disabled="submitting"
        @event="onDefer"
      />
      <AppButton
        v-if="stepKey === 'pet'"
        text="Pular por agora"
        variant="secondary"
        size="lg"
        :disabled="submitting"
        @event="onSkip"
      />
      <AppButton :text="continueText" type="submit" variant="primary" size="lg" :loading="submitting" />
    </div>
  </form>
</template>
