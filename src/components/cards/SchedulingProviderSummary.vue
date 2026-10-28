<script setup>
import UserCard from '@/components/cards/UserCard.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'

defineEmits(['retry'])

defineProps({
  provider: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <UserCard
    v-if="provider"
    :id="provider.id"
    :full_name="provider.full_name"
    :service_name="provider.service_type_name"
    :profile_photo="provider.profile_picture"
    :price_per_hour="provider.price_per_hour"
    :price_per_day="provider.price_per_day"
    :is_active="provider.is_active"
  />

  <section v-else class="flex flex-col gap-3">
    <h1 class="text-title text-fg">Agendamento</h1>

    <UiSkeleton v-if="loading" class="h-24 w-full" />

    <div v-else class="flex flex-col items-start gap-3">
      <p role="alert" class="text-caption font-semibold text-danger">
        {{ error || 'Não foi possível carregar os dados deste profissional.' }}
      </p>
      <AppButton text="Tentar novamente" variant="primary" :block="false" @event="$emit('retry')" />
    </div>
  </section>
</template>
