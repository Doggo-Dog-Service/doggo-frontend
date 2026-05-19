<script setup>
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { useServiceStore } from '@/stores/service'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const authStore = useAuthStore()
const clientStore = useClientStore()
const serviceStore = useServiceStore()
const router = useRouter()
const $toast = useToast()

const profileType = ref('client')
const userData = reactive({
  full_name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
})
const confirmPassword = ref('')
const typeServiceId = ref(0)

const changeProfileType = (type) => {
  profileType.value = type
}

onMounted(async () => {
  await serviceStore.getServices()
})

const handleRegister = async () => {
  if (userData.password !== confirmPassword.value) {
    $toast.error('As senhas não coincidem', {
      type: 'error',
      duration: 3000,
      position: 'top-right',
    })
    return
  }

  await authStore.createUser(userData)
  await authStore.login({
    email: userData.email,
    password: userData.password,
  })
  if (profileType.value === 'provider') {
    if (authStore.isAuthenticated) {
      router.push(`/auth/register/location/${typeServiceId.value}`)
    }
  } else {
    await clientStore.createClient()
    router.push('/')
  }
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full p-6 md:flex-row md:gap-15">
    <section class="w-full flex flex-col md:w-1/2 md:items-center md:gap-10">
      <div class="w-full flex flex-col md:items-center">
        <h1 class="text-doggo-black text-2xl font">Criar conta</h1>
        <p class="text-zinc-400">Preencha os dados para começar</p>
      </div>
      <div class="w-full flex flex-col gap-2">
        <h2 class="font-semibold">Tipo de conta</h2>
        <div class="flex gap-4">
          <ChoseButton
            text="Tutor"
            sub-text="Dono do pet"
            :selected="profileType === 'client'"
            @select="changeProfileType('client')"
          />
          <ChoseButton
            text="Profissional"
            sub-text="Prestador de serviço"
            :selected="profileType === 'provider'"
            @select="changeProfileType('provider')"
          />
        </div>
        <div v-if="profileType === 'provider'" class="w-full flex flex-col gap-2">
          <h2 class="font-semibold">Tipo de serviço <span class="text-red-400">*</span></h2>
          <ChoseButton
            v-for="(typeService, index) in serviceStore.typeServices"
            :key="index"
            :text="typeService.name"
            :sub-text="typeService.description"
            :selected="typeService.id === typeServiceId"
            @select="typeServiceId = typeService.id"
          />
        </div>
      </div>
    </section>
    <form @submit.prevent="handleRegister" class="w-full flex flex-col gap-4 md:w-1/2">
      <AppInput
        icon="mdi mdi-account-outline"
        label="Nome completo"
        placeholder="Seu Nome"
        v-model="userData.full_name"
        required
      />
      <AppInput
        icon="mdi mdi-email-outline"
        label="Email"
        placeholder="seu@email.com"
        v-model="userData.email"
        required
      />
      <AppInput
        icon="mdi mdi-file-document-outline"
        label="CPF"
        placeholder="-----------"
        v-model="userData.cpf"
        required
      />
      <AppInput
        icon="mdi mdi-phone-outline"
        label="Telefone"
        placeholder="-----------"
        v-model="userData.phone"
      />
      <AppInput
        icon="mdi mdi-lock-outline"
        label="Senha"
        type="password"
        placeholder="*****"
        v-model="userData.password"
        required
      />
      <AppInput
        icon="mdi mdi-check"
        label="Confirmar senha"
        type="password"
        placeholder="*****"
        v-model="confirmPassword"
        required
      />
      <AppButton
        :text="authStore.loading ? 'Registrando sua conta...' : 'Criar minha conta'"
        mode="outline"
        type="submit"
        :disabled="authStore.loading"
      />
      <div class="flex justify-center gap-2">
        <p>Já possui uma conta?</p>
        <RouterLink class="font-bold text-doggo-green" to="/auth/login">Entrar</RouterLink>
      </div>
    </form>
  </div>
</template>
