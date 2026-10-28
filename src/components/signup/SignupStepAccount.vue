<script setup>
import { Mail, Lock } from 'lucide-vue-next'
import AppInput from '@/components/inputs/AppInput.vue'
import { useSignupWizard } from '@/composables/useSignupWizard'

const { account, errors } = useSignupWizard()
</script>

<template>
  <div class="flex flex-col gap-4">
    <AppInput
      v-model="account.email"
      :icon="Mail"
      label="Email"
      type="email"
      placeholder="seu@email.com"
      autocomplete="email"
      :error="errors.email"
      required
    />
    <AppInput
      v-model="account.password"
      :icon="Lock"
      label="Senha"
      type="password"
      placeholder="Mínimo de 8 caracteres"
      autocomplete="new-password"
      hint="Use ao menos 8 caracteres."
      :error="errors.password"
      required
    />
    <AppInput
      v-model="account.confirmPassword"
      :icon="Lock"
      label="Confirmar senha"
      type="password"
      placeholder="Repita a senha"
      autocomplete="new-password"
      :error="errors.confirmPassword"
      required
    />
  </div>
</template>
