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
  <form @submit.prevent>
    <AppInput label="Email" placeholder="seu@email.com" v-model="data.email"/>
    <AppInput label="Password" placeholder="sua senha" v-model="data.password"/>
    <AppButton @event="handleLogin" :text="authStore.loading ? '...' : 'Entrar'" mode="outline" :disabled="authStore.loading"/>
  </form>
</template>
