<script setup>
import { User, FileText, Phone } from 'lucide-vue-next'
import AppInput from '@/components/inputs/AppInput.vue'
import ImageInput from '@/components/inputs/ImageInput.vue'
import { useSignupWizard } from '@/composables/useSignupWizard'
import { formatCpf, formatPhone } from '@/utils/masks'

const { personal, errors } = useSignupWizard()
</script>

<template>
  <div class="flex flex-col gap-5">
    <ImageInput v-model="personal.photo" label="Foto de perfil (opcional)" />
    <AppInput
      v-model="personal.full_name"
      :icon="User"
      label="Nome completo"
      placeholder="Seu nome"
      autocomplete="name"
      :error="errors.full_name"
      required
    />
    <AppInput
      :model-value="personal.cpf"
      :icon="FileText"
      label="CPF"
      placeholder="000.000.000-00"
      autocomplete="off"
      :error="errors.cpf"
      required
      @update:model-value="personal.cpf = formatCpf($event)"
    />
    <AppInput
      :model-value="personal.phone"
      :icon="Phone"
      label="Telefone"
      type="tel"
      placeholder="(00) 00000-0000"
      autocomplete="tel"
      hint="Opcional. Usado para contato sobre os passeios."
      :error="errors.phone"
      @update:model-value="personal.phone = formatPhone($event)"
    />
  </div>
</template>
