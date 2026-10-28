<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Dog, Footprints } from 'lucide-vue-next'
import UiSegmented from '@/components/ui/UiSegmented.vue'
import { useAuthStore } from '@/stores/auth'
import { homeRouteFor } from '@/router/navigation'

const authStore = useAuthStore()
const router = useRouter()

const OPTIONS = [
  { value: 'client', label: 'Tutor', icon: Dog },
  { value: 'provider', label: 'Passeador', icon: Footprints },
]

const current = computed({
  get: () => authStore.mode,
  set: (value) => {
    authStore.setMode(value)
    router.push(homeRouteFor(authStore.mode))
  },
})
</script>

<template>
  <UiSegmented v-if="authStore.hasBothProfiles" v-model="current" :options="OPTIONS" label="Modo de uso" />
</template>
