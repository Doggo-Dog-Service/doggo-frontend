<script setup>
import UserCard from '@/components/cards/UserCard.vue'
import AppButton from '@/components/buttons/AppButton.vue'

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
    <h1 class="text-xl font-bold">Agendamento</h1>

    <div v-if="loading" class="flex justify-center py-6">
      <div class="w-10 h-10 rounded-full border-l-2 border-doggo-green animate-spin"></div>
    </div>

    <div v-else class="flex flex-col items-start gap-3">
      <p class="text-red-700 text-sm font-semibold">
        {{ error || 'Não foi possível carregar os dados deste profissional.' }}
      </p>
      <AppButton text="Tentar novamente" mode="outline" @event="$emit('retry')" />
    </div>
  </section>
</template>
