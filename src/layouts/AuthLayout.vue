<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSignupWizard } from '@/composables/useSignupWizard'
import { useTheme } from '@/composables/useTheme.js'
import AuthDog from '@/components/auth/AuthDog.vue'

const { preference } = useTheme()
const isLight = computed(() => preference === 'light')

const route = useRoute()
const wizard = useSignupWizard()

// Cadastro em etapas: coluna única; o perfil do passeador (mapa) precisa de mais largura.
const widthClass = computed(() => {
  if (route.name !== 'signup-view') return 'max-w-md'
  return wizard.stepKey.value === 'provider' ? 'max-w-3xl' : 'max-w-xl'
})
</script>

<template>
  <div class="min-h-dvh bg-canvas text-fg">
    <div :class="['mx-auto flex w-full flex-col gap-6 px-4 py-8 md:py-12', widthClass]">
      <RouterLink to="/" class="self-center rounded-control focus-visible:ring-2 focus-visible:ring-primary">
        <img class="h-10 w-auto" :src="isLight ? '/logo.png' : '/logo-dark-mode.png'" alt="Doggo" />
      </RouterLink>
      <!-- O cachorro "senta" na borda do cartão: o cartão cobre a base da sombra. -->
      <AuthDog :compact="route.name === 'signup-view'" class="-mb-7" />
      <main class="relative z-10 overflow-hidden rounded-card border border-line bg-surface p-6 shadow-card md:p-8">
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
            leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <component :is="Component" :key="$route.name" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
