<script setup>
import { computed, watch } from 'vue'
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
import { homeRouteFor } from '@/router/navigation'
import notify from '@/utils/notify'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const wizard = useSignupWizard()
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
const continueText = computed(() => (isLastStep.value ? 'Concluir cadastro' : 'Continuar'))

wizard.resetIfSessionLost()

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

// Etapa -> URL (depois de ações que mudam a etapa).
function syncRoute() {
  if (String(step.value) !== route.query.etapa) router.push({ query: { etapa: String(step.value) } })
}

async function complete() {
  await authStore.fetchUser()
  wizard.reset()
  notify.success('Cadastro concluído')
  router.replace(homeRouteFor(authStore.mode))
}

async function onNext() {
  const wasLast = isLastStep.value
  const ok = await wizard.next()
  if (ok && wasLast) return complete()
  syncRoute()
}

function onBack() {
  if (wizard.back()) syncRoute()
}
</script>

<template>
  <form class="flex flex-col gap-6 pb-24 md:pb-0" novalidate @submit.prevent="onNext">
    <UiSteps :current="step" :total="totalSteps" aria-label="Progresso do cadastro" />
    <header class="flex flex-col gap-1">
      <h1 class="text-title text-fg">{{ current.title }}</h1>
      <p v-if="current.subtitle" class="text-body text-fg-muted">{{ current.subtitle }}</p>
    </header>

    <component :is="current.component" :key="stepKey" />

    <div
      class="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:static md:z-auto md:border-0 md:bg-transparent md:p-0"
    >
      <AppButton v-if="canGoBack" text="Voltar" variant="secondary" size="lg" :disabled="submitting" @event="onBack" />
      <AppButton :text="continueText" type="submit" variant="primary" size="lg" :loading="submitting" />
    </div>
  </form>
</template>
