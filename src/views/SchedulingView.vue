<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import UiCard from '@/components/ui/UiCard.vue'
import CalendarPicker from '@/components/calendar/CalendarPicker.vue'
import SchedulingPetCardSelector from '@/components/inputs/SchedulingPetCardSelector.vue'
import SchedulingProviderSummary from '@/components/cards/SchedulingProviderSummary.vue'
import SchedulingSlots from '@/components/inputs/SchedulingSlots.vue'
import SchedulingSubmitBar from '@/components/layouts/SchedulingSubmitBar.vue'
import { useScheduling } from '@/composables/useScheduling'

const route = useRoute()

const providerId = computed(() => route.params.providerId)

const {
  provider,
  providerLoading,
  pageError,
  pets,
  petsLoading,
  petsError,
  slots,
  slotsLoading,
  slotsError,
  selectedDate,
  selectedTime,
  selectedPets,
  submitError,
  submitting,
  isReadyToSubmit,
  reload,
  submit,
} = useScheduling({ providerId })
</script>

<template>
  <div class="flex flex-col gap-6 p-4 pb-44 text-fg md:p-6 md:pb-6">
    <SchedulingProviderSummary
      :provider="provider"
      :loading="providerLoading"
      :error="pageError"
      @retry="reload"
    />

    <section class="flex flex-col gap-3">
      <h2 class="text-subtitle text-fg">Selecione o dia</h2>
      <UiCard>
        <CalendarPicker v-model="selectedDate" />
      </UiCard>
    </section>

    <SchedulingSlots
      v-model="selectedTime"
      :slots="slots"
      :has-date="!!selectedDate"
      :loading="slotsLoading"
      :error="slotsError"
    />

    <SchedulingPetCardSelector
      v-model="selectedPets"
      :pets="pets"
      :loading="petsLoading"
      :error="petsError"
    />

    <SchedulingSubmitBar
      :disabled="!isReadyToSubmit"
      :loading="submitting"
      :error="submitError"
      @submit="submit"
    />
  </div>
</template>
