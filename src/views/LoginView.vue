<script setup>
import AppInput from '@/components/inputs/AppInput.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()

const data = reactive({
  email: '',
  password: '',
})

async function handleLogin() {
  await authStore.login(data)
  if (authStore.isAuthenticated) {
    router.push('/')
  }
}
</script>

<template>
  <div class="p-4 flex flex-col gap-6">
    <section class="flex flex-col">
      <h1 class="text-doggo-black text-2xl">Bem-vindo de volta</h1>
      <p class="text-zinc-400">Entre na sua conta para continuar</p>
    </section>
    <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
      <AppInput type="email" label="Email" placeholder="seu@email.com" v-model="data.email" />
      <AppInput label="Password" placeholder="sua senha" v-model="data.password" />
      <AppButton
        type="submit"
        :text="authStore.loading ? '...' : 'Entrar'"
        mode="outline"
        :disabled="authStore.loading"
      />
    </form>
  </div>
</template>
