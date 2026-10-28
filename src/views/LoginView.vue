<script setup>
import AppInput from '@/components/inputs/AppInput.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { Mail, Lock } from 'lucide-vue-next'
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import { safeRedirect } from '@/utils/safeRedirect'
import { homeRouteFor } from '@/router/navigation'
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const data = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  const ok = await authStore.login(data)
  if (ok) router.push(safeRedirect(route.query.redirect) ?? homeRouteFor(authStore.mode))
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-1">
      <h1 class="text-title text-fg">Bem-vindo de volta</h1>
      <p class="text-body text-fg-muted">Entre na sua conta para continuar</p>
    </section>
    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <AppInput
        :icon="Mail"
        type="email"
        autocomplete="email"
        label="Email"
        placeholder="seu@email.com"
        v-model="data.email"
      />
      <AppInput
        :icon="Lock"
        label="Senha"
        autocomplete="current-password"
        type="password"
        placeholder="sua senha"
        v-model="data.password"
      />
      <AppButton
        type="submit"
        :text="authStore.loading ? 'Carregando...' : 'Entrar'"
        variant="primary"
        size="lg"
        :loading="authStore.loading"
      />
    </form>
    <p class="flex flex-wrap justify-center gap-2 text-body text-fg-muted">
      Não possui uma conta ainda?
      <RouterLink class="font-semibold text-primary hover:underline" to="/auth/register">Registrar-se</RouterLink>
    </p>
  </div>
</template>
