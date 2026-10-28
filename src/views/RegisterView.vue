<script setup>
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import ImageInput from '@/components/inputs/ImageInput.vue'
import { User, Mail, FileText, Phone, Lock, Check } from 'lucide-vue-next'
import { onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { useServiceTypeStore } from '@/stores/serviceType'
import { useMedia } from '@/composables/useMedia'
import { useRouter } from 'vue-router'
import notify from '@/utils/notify'

const authStore = useAuthStore()
const clientStore = useClientStore()
const serviceTypeStore = useServiceTypeStore()
const { postImage } = useMedia()
const router = useRouter()

const profileType = ref('client')
const userData = reactive({
  full_name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
})
const profilePicture = ref(null)
const confirmPassword = ref('')
const typeServiceId = ref(0)

const changeProfileType = (type) => {
  profileType.value = type
}

onMounted(async () => {
  await serviceTypeStore.getTypeServices()
})

const saveProfilePicture = async (userId) => {
  const newImage = await postImage({
    file: profilePicture.value,
    description: userData.email,
  })

  if (!newImage?.attachment_key) {
    notify.error('Não foi possível enviar a foto de perfil. Você poderá adicioná-la depois.')
    return false
  }

  const updatedUser = await authStore.updateUser(userId, {
    profile_picture_attachment_key: newImage.attachment_key,
  })

  return !!updatedUser
}

const handleRegister = async () => {
  if (userData.password !== confirmPassword.value) {
    notify.error('As senhas não coincidem')
    return
  }

  const user = await authStore.createUser(userData)
  if (!user) return

  const loggedIn = await authStore.login({
    email: userData.email,
    password: userData.password,
  })
  if (!loggedIn) return

  // O upload exige login; falha na foto não bloqueia o cadastro.
  if (profilePicture.value) {
    const pictureSaved = await saveProfilePicture(user.id)
    if (pictureSaved) {
      await authStore.fetchUser()
    }
  }

  if (profileType.value === 'provider') {
    router.push(`/auth/register/location/${typeServiceId.value}`)
  } else {
    await clientStore.createClient()
    router.push('/')
  }
}
</script>

<template>
  <div class="flex flex-col gap-8 md:flex-row md:gap-10">
    <section class="flex w-full flex-col gap-6 md:w-1/2">
      <div class="flex flex-col gap-1">
        <h1 class="text-title text-fg">Criar conta</h1>
        <p class="text-body text-fg-muted">Preencha os dados para começar</p>
      </div>
      <ImageInput label="Imagem de perfil" v-model="profilePicture" />
      <div class="flex w-full flex-col gap-3">
        <h2 class="text-subtitle text-fg">Tipo de conta</h2>
        <div class="grid grid-cols-2 gap-3">
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
        <div v-if="profileType === 'provider'" class="flex w-full flex-col gap-3">
          <h2 class="text-subtitle text-fg">Tipo de serviço <span class="text-danger">*</span></h2>
          <ChoseButton
            v-for="(typeService, index) in serviceTypeStore.typeServices"
            :key="index"
            :text="typeService.name"
            :sub-text="typeService.description"
            :selected="typeService.id === typeServiceId"
            @select="typeServiceId = typeService.id"
          />
        </div>
      </div>
    </section>
    <form @submit.prevent="handleRegister" class="flex w-full flex-col gap-4 md:w-1/2">
      <AppInput
        :icon="User"
        label="Nome completo"
        placeholder="Seu Nome"
        v-model="userData.full_name"
        required
      />
      <AppInput
        :icon="Mail"
        label="Email"
        placeholder="seu@email.com"
        v-model="userData.email"
        required
      />
      <AppInput
        :icon="FileText"
        label="CPF"
        placeholder="-----------"
        v-model="userData.cpf"
        required
      />
      <AppInput
        :icon="Phone"
        label="Telefone"
        placeholder="-----------"
        v-model="userData.phone"
      />
      <AppInput
        :icon="Lock"
        label="Senha"
        type="password"
        placeholder="*****"
        v-model="userData.password"
        required
      />
      <AppInput
        :icon="Check"
        label="Confirmar senha"
        type="password"
        placeholder="*****"
        v-model="confirmPassword"
        required
      />
      <AppButton
        :text="authStore.loading ? 'Registrando sua conta...' : 'Criar minha conta'"
        variant="primary"
        size="lg"
        type="submit"
        :loading="authStore.loading"
      />
      <p class="flex flex-wrap justify-center gap-2 text-body text-fg-muted">
        Já possui uma conta?
        <RouterLink class="font-semibold text-primary hover:underline" to="/auth/login">Entrar</RouterLink>
      </p>
    </form>
  </div>
</template>
