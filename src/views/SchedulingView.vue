<script setup>
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import AppButton from '@/components/buttons/AppButton.vue'
import UiCard from '@/components/ui/UiCard.vue'
import UiSteps from '@/components/ui/UiSteps.vue'
import CalendarPicker from '@/components/calendar/CalendarPicker.vue'
import SchedulingPetCardSelector from '@/components/inputs/SchedulingPetCardSelector.vue'
import SchedulingProviderSummary from '@/components/cards/SchedulingProviderSummary.vue'
import SchedulingSlots from '@/components/inputs/SchedulingSlots.vue'
import SchedulingReview from '@/components/scheduling/SchedulingReview.vue'
import SchedulingSuccess from '@/components/scheduling/SchedulingSuccess.vue'
import PetModal from '@/components/pet/PetModal.vue'
import { useScheduling } from '@/composables/useScheduling'
import notify from '@/utils/notify'
import { formatCurrency } from '@/utils/currency'
import { estimatePrice } from '@/utils/price'

const route = useRoute()
const router = useRouter()

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
  submitting,
  durationMinutes,
  serviceTypeId,
  reload,
  reloadPets,
  submit,
} = useScheduling({ providerId })

const TITLES = { 1: 'Quem vai passear?', 2: 'Quando?', 3: 'Revise e solicite' }
const TOTAL_STEPS = 3

const sent = shallowRef(false)
const petModalOpen = shallowRef(false)

const hasPets = computed(() => selectedPets.value.length > 0)
const hasSlot = computed(() => !!selectedDate.value && !!selectedTime.value)

function canEnter(target) {
  if (target <= 1) return true
  if (target === 2) return hasPets.value
  return hasPets.value && hasSlot.value && !!provider.value
}

// A etapa vem da URL, mas nunca passa de onde a seleção atual permite.
const step = computed(() => {
  const parsed = Number.parseInt(route.query.etapa, 10)
  let target = Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), TOTAL_STEPS) : 1

  while (target > 1 && !canEnter(target)) target -= 1

  return target
})

watch(
  step,
  (value) => {
    if (String(value) !== route.query.etapa) {
      router.replace({ query: { ...route.query, etapa: String(value) } })
    }
  },
  { immediate: true },
)

// Leitores de tela e teclado seguem para o conteúdo do novo passo.
const heading = useTemplateRef('heading')
watch(step, async () => {
  await nextTick()
  heading.value?.focus()
})

function goTo(target) {
  router.push({ query: { ...route.query, etapa: String(target) } })
}

const selectedPetObjects = computed(() =>
  pets.value.filter((pet) => selectedPets.value.includes(pet.id)),
)

const price = computed(() => estimatePrice(provider.value, durationMinutes.value))
const priceText = computed(() => (price.value === null ? 'Preço a combinar' : formatCurrency(price.value)))

const canContinue = computed(() => canEnter(step.value + 1))

function goBack() {
  if (step.value > 1) goTo(step.value - 1)
  else router.push(`/provider/${providerId.value}`)
}

async function onSubmit() {
  if (submitting.value) return

  const result = await submit()

  if (result === null) {
    notify.error(
      serviceTypeId.value
        ? 'Não foi possível solicitar o passeio. Tente novamente.'
        : 'Não foi possível identificar o tipo de serviço deste passeador.',
    )
  } else if (result === 'ok') {
    sent.value = true
  } else if (result === 'conflict') {
    goTo(2)
  }
}

async function closePetModal() {
  petModalOpen.value = false
  await reloadPets()
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-col gap-5 p-4 pb-40 text-fg md:p-6 md:pb-32">
    <SchedulingSuccess v-if="sent" :provider-name="provider?.full_name" />

    <template v-else>
      <div class="sticky top-0 z-20 -mx-4 flex flex-col gap-3 bg-canvas px-4 pb-3 pt-1 md:-mx-6 md:px-6">
        <SchedulingProviderSummary
          :provider="provider"
          :loading="providerLoading"
          :error="pageError"
          @retry="reload"
        />
        <UiSteps :current="step" :total="TOTAL_STEPS" aria-label="Progresso do agendamento" />
      </div>

      <h1 ref="heading" tabindex="-1" class="text-title text-fg focus:outline-none">{{ TITLES[step] }}</h1>

      <SchedulingPetCardSelector
        v-if="step === 1"
        v-model="selectedPets"
        :pets="pets"
        :loading="petsLoading"
        :error="petsError"
        @add-pet="petModalOpen = true"
      />

      <template v-else-if="step === 2">
        <UiCard>
          <CalendarPicker v-model="selectedDate" />
        </UiCard>
        <SchedulingSlots
          v-model="selectedTime"
          :slots="slots"
          :has-date="!!selectedDate"
          :loading="slotsLoading"
          :error="slotsError"
        />
      </template>

      <SchedulingReview
        v-else-if="provider"
        :provider="provider"
        :pets="selectedPetObjects"
        :date="selectedDate"
        :time="selectedTime"
        :duration-minutes="durationMinutes"
      />

      <div
        class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3"
      >
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-2">
          <p v-if="provider" class="flex items-baseline justify-between text-body">
            <span class="text-fg-muted">Preço estimado</span>
            <span class="font-bold text-fg">{{ priceText }}</span>
          </p>
          <div class="flex gap-3">
            <AppButton text="Voltar" variant="secondary" :block="false" @event="goBack" />
            <AppButton
              v-if="step < TOTAL_STEPS"
              data-test="next"
              text="Continuar"
              variant="primary"
              :disabled="!canContinue"
              @event="goTo(step + 1)"
            />
            <AppButton
              v-else
              data-test="submit"
              text="Solicitar passeio"
              variant="primary"
              :loading="submitting"
              :disabled="!provider"
              @event="onSubmit"
            />
          </div>
        </div>
      </div>
    </template>

    <PetModal v-if="petModalOpen" mode="add" @close="closePetModal" />
  </div>
</template>
