<script setup>
import AppButton from '@/components/buttons/AppButton.vue'
import UserCard from '@/components/cards/UserCard.vue'
import CalendarPicker from '@/components/calendar/CalendarPicker.vue'
import TimeSlotButton from '@/components/calendar/TimeSlotButton.vue'
import { ref, onMounted, reactive, computed } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useServiceStore } from '@/stores/service'
import { useRouter } from 'vue-router'

const serviceStore = useServiceStore()
const providerStore = useProviderStore()
const router = useRouter()

const provider = ref(null)
const selectedDate = ref(null)
const selectedTime = ref(null)

const availablePeriods = computed(() => {
  const periods = [
    {
      label: 'Manhã',
      slots: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
    },
    {
      label: 'Tarde',
      slots: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
    },
    {
      label: 'Noite',
      slots: ['18:00', '19:00', '20:00', '21:00'],
    },
  ]

  if (!selectedDate.value) return periods

  const day = selectedDate.value.getDate()
  return periods.map((period) => ({
    ...period,
    slots: period.slots.map((time) => ({
      time,
      disabled: day % 2 === 0 && (time < '08:00' || time >= '20:00'),
    })),
  }))
})

function handleSubmit() {
  if (!selectedDate.value || !selectedTime.value) return

  const [hours, minutes] = selectedTime.value.split(':')
  const startDatetime = new Date(selectedDate.value)
  startDatetime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0)

  const endDatetime = new Date(startDatetime)
  endDatetime.setHours(endDatetime.getHours() + 1)

  serviceData.start_datetime = startDatetime.toISOString()
  serviceData.end_datetime = endDatetime.toISOString()

  serviceStore.postService(serviceData)
  router.push('/')
}

const serviceData = reactive({
  pet: null,
  provider: null,
  service_type: null,
  start_datetime: '',
})

onMounted(async () => {
  provider.value = await providerStore.fetchProvider(router.currentRoute.value.params.providerId)
  if(provider.value) {
    serviceData.provider = provider.value.id
    serviceData.service_type = provider.value.service_type.id
  }
})
</script>

<template>
  <div class="flex flex-col gap-6 p-6 mb-19 text-doggo-black pb-22">
    <UserCard
      v-if="provider"
      :id="provider.id"
      :full_name="provider.user.full_name"
      :service_name="provider.service_type.name"
      :fixed_latitude="provider.fixed_latitude"
      :fixed_longitude="provider.fixed_longitude"
      :is_active="provider.is_active"
      :price_per_day="provider.price_per_day"
      :price_per_hour="provider.price_per_hour"
      :profile_photo="provider.user.profile_picture?.url"
    />

    <section class="flex flex-col gap-3">
      <h2 class="text-lg font-bold">Selecione o dia</h2>
      <div class="bg-white border border-doggo-gray rounded-xl p-4">
        <CalendarPicker v-model="selectedDate" />
      </div>
    </section>

    <section v-if="selectedDate" class="flex flex-col gap-4">
      <h2 class="text-lg font-bold">Horários disponíveis</h2>
      <div v-for="(period, index) in availablePeriods" :key="index" class="flex flex-col gap-2">
        <p class="text-sm text-doggo-black/50 font-semibold">{{ period.label }}</p>
        <div class="flex flex-wrap gap-2">
          <TimeSlotButton
            v-for="(slot, index) in period.slots"
            :key="index"
            :time="slot.time"
            :selected="selectedTime === slot.time"
            :disabled="slot.disabled"
            @select="selectedTime = slot.time"
          />
        </div>
      </div>
    </section>

    <section v-else class="flex flex-col gap-3">
      <p class="text-doggo-black/50 text-sm">Selecione uma data para ver os horários disponíveis</p>
    </section>

    <div class="fixed bottom-22 left-0 right-0 px-6 md:relative md:bottom-auto md:left-auto md:right-auto md:px-0 md:mt-2">
      <AppButton
        :disabled="!selectedDate || !selectedTime"
        :text="serviceStore.loading ? 'Enviando...' : 'Confirmar agendamento'"
        mode="outline"
        @event="handleSubmit"
      />
    </div>
  </div>
</template>
