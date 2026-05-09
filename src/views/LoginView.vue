<script setup>
import gsap from 'gsap'
import AppInput from '@/components/inputs/AppInput.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { onMounted, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
const authStore = useAuthStore()
const router = useRouter()

const data = reactive({
  email: '',
  password: '',
})

const handleLogin = async () => {
  await authStore.login(data)
  if (authStore.isAuthenticated) {
    router.push('/')
  }
}

onMounted(() => {
  const blobs = gsap.utils.toArray('.blob')

  blobs.forEach((blob, i) => {
    gsap.to(blob, {
      x: () => gsap.utils.random(-200, 200),
      y: () => gsap.utils.random(-200, 200),
      scale: () => gsap.utils.random(0.8, 1.4),
      duration: () => gsap.utils.random(6, 12),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.5,
    })
  })
})
</script>

<template>
  <div class="flex flex-col justify-center items-center bg-linear-to-b from-doggo-green to-doggo-light-green min-h-screen md:gap-10">
    <div class="fixed flex flex-col items-center justify-center inset-0 overflow-hidden h-1/3 z-0 md:h-full md:justify-start">
      <div :class="['blob', 'absolute w-100 h-100 rounded-full opacity-60 bg-white/5 md:w-screen md:h-screen']"></div>
      <div :class="['blob', 'absolute w-100 h-100 rounded-full opacity-60 bg-white/5 md:w-screen md:h-screen']"></div>
      <div :class="['blob', 'absolute w-100 h-100 rounded-full opacity-60 bg-white/5 md:w-screen md:h-screen']"></div>
      <img class="md:translate-y-30" src="/white-logo.svg" alt="Logo Doggo." />
    </div>
    <div
      class="fixed w-full min-h-2/3 bottom-0 right-0 left-0 p-10 rounded-t-2xl flex flex-col gap-6 bg-background-light md:relative md:rounded-2xl md:w-1/2 md:text-center md:shadow-2xl md:translate-y-20"
    >
      <section class="flex flex-col">
        <h1 class="text-doggo-black text-2xl">Bem-vindo de volta</h1>
        <p class="text-zinc-400">Entre na sua conta para continuar</p>
      </section>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
        <AppInput
          icon="mdi mdi-email-outline"
          type="email"
          label="Email"
          placeholder="seu@email.com"
          v-model="data.email"
        />
        <AppInput
          icon="mdi mdi-lock-outline"
          label="Password"
          type="password"
          placeholder="sua senha"
          v-model="data.password"
        />
        <AppButton
          type="submit"
          :text="authStore.loading ? 'Carregando...' : 'Entrar'"
          mode="outline"
          :disabled="authStore.loading"
        />
      </form>
      <div class="flex justify-center gap-2">
        <p>Não possui uma conta ainda?</p>
        <RouterLink class="font-bold text-doggo-green" to="/auth/register">Registrar-se</RouterLink>
      </div>
    </div>
  </div>
</template>
