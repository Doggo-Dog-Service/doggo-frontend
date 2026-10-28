<script setup>
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push({ name: 'login-view' })
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <h1 class="text-display text-fg">Perfil</h1>
    <UiEmptyState title="Em breve" description="Seus dados e preferências ficarão aqui." />
    <AppButton text="Sair" variant="secondary" :icon="LogOut" @event="logout" />
  </section>
</template>
