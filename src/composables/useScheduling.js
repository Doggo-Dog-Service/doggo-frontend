import { computed, shallowRef, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'

import { useAuthStore } from '@/stores/auth'
import { useAvailabilityStore } from '@/stores/availability'
import { usePetStore } from '@/stores/pet'
import { useProviderStore } from '@/stores/provider'
import { useServiceTypeStore } from '@/stores/serviceType'
import { createService } from '@/services/service'
import { fromDateAndTime, toLocalIsoString } from '@/utils/date'

const TOAST_OPTIONS = {
  type: 'error',
  duration: 4000,
  position: 'top-right',
}

/**
 * Orquestra a tela de agendamento: carrega os dados necessários,
 * mantém a seleção (data, horário e pets) e envia a solicitação.
 * A view apenas compõe o template; a lógica fica aqui.
 *
 * @param {object} options
 * @param {import('vue').MaybeRefOrGetter<number|string|null>} [options.providerId]
 *   Id do profissional. Aceita valor, ref ou getter (ex.: a rota).
 */
export function useScheduling(options = {}) {
  const { providerId: providerIdInput } = options

  const $toast = useToast()
  const router = useRouter()

  const authStore = useAuthStore()
  const availabilityStore = useAvailabilityStore()
  const petStore = usePetStore()
  const providerStore = useProviderStore()
  const serviceTypeStore = useServiceTypeStore()

  const { slots, loading: slotsLoading, error: slotsError } = storeToRefs(availabilityStore)
  const { pets, loading: petsLoading, error: petsError } = storeToRefs(petStore)
  const { typeServices } = storeToRefs(serviceTypeStore)
  const { loading: providerLoading } = storeToRefs(providerStore)

  const provider = shallowRef(null)
  const selectedDate = shallowRef(null)
  const selectedTime = shallowRef(null)
  const selectedPets = shallowRef([])
  const pageError = shallowRef('')
  const submitError = shallowRef('')
  const submitting = shallowRef(false)

  const providerId = computed(() => {
    const id = Number(toValue(providerIdInput))

    return Number.isInteger(id) && id > 0 ? id : null
  })

  const clientId = computed(() => authStore.user?.client_profile?.id ?? null)

  const serviceTypeId = computed(() => {
    const name = provider.value?.service_type_name

    if (!name) return null

    return typeServices.value.find((type) => type.name === name)?.id ?? null
  })

  const isReadyToSubmit = computed(
    () =>
      !!provider.value &&
      !!serviceTypeId.value &&
      !!selectedDate.value &&
      !!selectedTime.value &&
      selectedPets.value.length > 0 &&
      !submitting.value,
  )

  async function load() {
    pageError.value = ''

    if (!providerId.value || !clientId.value) {
      await router.replace('/')
      return
    }

    provider.value = null
    petStore.error = ''

    const requests = [
      providerStore.fetchProvider(providerId.value),
      petStore.getPets({ owner_id: clientId.value }),
    ]

    if (!typeServices.value.length) {
      requests.push(serviceTypeStore.getTypeServices())
    }

    const [fetchedProvider] = await Promise.all(requests)

    provider.value = fetchedProvider ?? null

    if (!provider.value) {
      pageError.value = 'Não foi possível carregar os dados deste profissional.'
      return
    }

    if (!serviceTypeId.value) {
      $toast.error('Não foi possível identificar o tipo de serviço do profissional.', TOAST_OPTIONS)
    }
  }

  async function refreshSlots() {
    selectedTime.value = null

    if (!selectedDate.value || !providerId.value) {
      availabilityStore.clearSlots()
      return
    }

    await availabilityStore.getSlots(providerId.value, selectedDate.value)
  }

  async function submit() {
    if (!isReadyToSubmit.value) return

    const startDatetime = fromDateAndTime(selectedDate.value, selectedTime.value)

    if (!startDatetime) return

    submitting.value = true
    submitError.value = ''

    try {
      await createService({
        pets: [...selectedPets.value],
        provider: provider.value.id,
        service_type: serviceTypeId.value,
        start_datetime: toLocalIsoString(startDatetime),
      })

      $toast.success('Solicitação enviada! Aguarde a resposta do profissional.', {
        ...TOAST_OPTIONS,
        type: 'success',
        duration: 3000,
      })

      await router.push({ name: 'services-view' })
    } catch (error) {
      submitError.value =
        error?.message || 'Não foi possível enviar a solicitação. Tente novamente.'
      $toast.error(submitError.value, TOAST_OPTIONS)

      if (error?.status === 409) {
        await refreshSlots()
      }
    } finally {
      submitting.value = false
    }
  }

  watch(providerId, load, { immediate: true })

  watch(
    selectedDate,
    async () => {
      submitError.value = ''

      await refreshSlots()
    },
    { immediate: true },
  )

  return {
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
    reload: load,
    submit,
  }
}
