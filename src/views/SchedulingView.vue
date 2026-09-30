<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import CalendarPicker from '@/components/calendar/CalendarPicker.vue'
import SchedulingPetSelector from '@/components/scheduling/SchedulingPetSelector.vue'
import SchedulingProviderSummary from '@/components/scheduling/SchedulingProviderSummary.vue'
import SchedulingSlots from '@/components/scheduling/SchedulingSlots.vue'
import SchedulingSubmitBar from '@/components/scheduling/SchedulingSubmitBar.vue'
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
  <div class="flex flex-col gap-6 p-6 mb-19 text-doggo-black pb-22">
    <SchedulingProviderSummary
      :provider="provider"
      :loading="providerLoading"
      :error="pageError"
      @retry="reload"
    />

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-bold">Selecione o dia</h2>
      <div class="bg-white border border-doggo-gray rounded-xl p-4">
        <CalendarPicker v-model="selectedDate" />
      </div>
    </section>

    <SchedulingSlots
      v-model="selectedTime"
      :slots="slots"
      :has-date="!!selectedDate"
      :loading="slotsLoading"
      :error="slotsError"
    />

    <SchedulingPetSelector
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
