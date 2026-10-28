<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { LogOut, Monitor, Moon, Phone, Save, Sun, User } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSegmented from '@/components/ui/UiSegmented.vue'
import ModeSwitch from '@/components/shell/ModeSwitch.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import notify from '@/utils/notify'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'

const authStore = useAuthStore()
const router = useRouter()
const { preference, setPreference } = useTheme()

const THEME_OPTIONS = [
  { value: 'system', label: 'Sistema', icon: Monitor },
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Escuro', icon: Moon },
]

const theme = computed({
  get: () => preference.value,
  set: (value) => setPreference(value),
})

// O telefone não volta da API (write-only): começa vazio e só é enviado se preenchido.
const form = reactive({ full_name: '', phone: '' })
// O usuário pode carregar depois da montagem; só preenche enquanto o campo está vazio.
watch(
  () => authStore.user?.full_name,
  (name) => {
    if (name && !form.full_name) form.full_name = name
  },
  { immediate: true },
)
const errors = reactive({ full_name: '', phone: '' })
const saving = ref(false)

function validate() {
  errors.full_name = form.full_name.trim() ? '' : 'Informe seu nome.'
  const digits = form.phone.replace(/\D/g, '')
  errors.phone = digits && (digits.length < 10 || digits.length > 11) ? 'Informe um telefone com DDD.' : ''
  return !errors.full_name && !errors.phone
}

async function save() {
  if (!validate()) return
  saving.value = true
  const ok = await authStore.updateProfile({
    full_name: form.full_name.trim(),
    phone: form.phone.replace(/\D/g, ''),
  })
  saving.value = false
  if (ok) notify.success('Perfil atualizado')
}

function logout() {
  authStore.logout()
  router.push({ name: 'login-view' })
}
</script>

<template>
  <section class="mx-auto flex w-full max-w-xl flex-col gap-6">
    <h1 class="hidden text-display text-fg md:block">Perfil</h1>

    <div class="flex items-center gap-4">
      <UiAvatar :src="authStore.user?.profile_picture?.file" :name="authStore.user?.full_name" size="lg" />
      <div class="min-w-0">
        <p class="truncate text-title text-fg">{{ authStore.user?.full_name }}</p>
        <p class="truncate text-body text-fg-muted">{{ authStore.user?.email }}</p>
      </div>
    </div>

    <UiCard padding="lg">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="save">
        <h2 class="text-subtitle text-fg">Seus dados</h2>
        <AppInput v-model="form.full_name" label="Nome completo" :icon="User" :error="errors.full_name" required />
        <AppInput
          v-model="form.phone"
          label="Telefone"
          type="tel"
          :icon="Phone"
          placeholder="(11) 99999-9999"
          hint="Preencha apenas para alterar o telefone cadastrado."
          :error="errors.phone"
        />
        <AppButton text="Salvar alterações" type="submit" variant="primary" :icon="Save" :loading="saving" />
      </form>
    </UiCard>

    <UiCard v-if="authStore.hasBothProfiles" padding="lg" class="flex flex-col gap-3">
      <h2 class="text-subtitle text-fg">Modo de uso</h2>
      <p class="text-body text-fg-muted">Você é tutor e passeador. Escolha como quer usar o DOGGO agora.</p>
      <ModeSwitch />
    </UiCard>

    <UiCard padding="lg" class="flex flex-col gap-3">
      <h2 class="text-subtitle text-fg">Aparência</h2>
      <UiSegmented v-model="theme" :options="THEME_OPTIONS" label="Tema" />
    </UiCard>

    <AppButton text="Sair" variant="secondary" :icon="LogOut" @event="logout" />
  </section>
</template>
