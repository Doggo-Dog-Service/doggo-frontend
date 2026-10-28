<script setup>
import { Dog, Footprints, Check } from 'lucide-vue-next'
import UiIcon from '@/components/ui/UiIcon.vue'
import { useSignupWizard } from '@/composables/useSignupWizard'

const { roles, errors } = useSignupWizard()

const OPTIONS = [
  { key: 'client', title: 'Tenho cão', description: 'Quero encontrar passeadores e agendar passeios.', icon: Dog },
  { key: 'provider', title: 'Quero passear', description: 'Quero oferecer passeios e receber pedidos.', icon: Footprints },
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-body text-fg-muted">Você pode escolher as duas opções.</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <button
        v-for="option in OPTIONS"
        :key="option.key"
        type="button"
        :aria-pressed="roles[option.key]"
        :class="[
          'relative flex min-h-28 cursor-pointer flex-col items-start gap-2 rounded-card border-2 p-4 text-left transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
          roles[option.key] ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:bg-surface-muted',
        ]"
        @click="roles[option.key] = !roles[option.key]"
      >
        <span class="flex size-10 items-center justify-center rounded-full bg-primary text-primary-fg">
          <UiIcon :icon="option.icon" :size="22" />
        </span>
        <span class="text-subtitle text-fg">{{ option.title }}</span>
        <span class="text-caption text-fg-muted">{{ option.description }}</span>
        <span
          v-if="roles[option.key]"
          class="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-fg"
        >
          <Check :size="14" :stroke-width="3" aria-hidden="true" />
          <span class="sr-only">Selecionado</span>
        </span>
      </button>
    </div>
    <p v-if="errors.roles" role="alert" class="text-caption text-danger">{{ errors.roles }}</p>
  </div>
</template>
