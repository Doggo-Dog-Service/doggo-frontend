import { computed, shallowRef, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import notify from '@/utils/notify'

import { useAuthStore } from '@/stores/auth'
import { useAvailabilityStore } from '@/stores/availability'
import { usePetStore } from '@/stores/pet'
import { useProviderStore } from '@/stores/provider'
import { useServiceTypeStore } from '@/stores/serviceType'
import { createService } from '@/services/service'
import { fromDateAndTime, toLocalIsoString } from '@/utils/date'

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

  const durationMinutes = computed(() => {
    const name = provider.value?.service_type_name

    return typeServices.value.find((type) => type.name === name)?.duration_minutes ?? 60
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
      notify.error('Não foi possível identificar o tipo de serviço do profissional.')
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

  async function reloadPets() {
    if (!clientId.value) return

    petStore.error = ''
    await petStore.getPets({ owner_id: clientId.value })
  }

  /**
   * Envia a solicitação. Retorna 'ok', 'conflict' (horário ocupado),
   * 'error' ou null quando não há o que enviar (ou já está enviando).
   */
  async function submit() {
    if (!isReadyToSubmit.value) return null

    const startDatetime = fromDateAndTime(selectedDate.value, selectedTime.value)

    if (!startDatetime) return null

    submitting.value = true
    submitError.value = ''

    try {
      await createService({
        pets: [...selectedPets.value],
        provider: provider.value.id,
        service_type: serviceTypeId.value,
        start_datetime: toLocalIsoString(startDatetime),
      })

      return 'ok'
    } catch (error) {
      if (error?.status === 409) {
        submitError.value = 'Esse horário acabou de ser ocupado. Escolha outro.'
        notify.error(submitError.value)
        await refreshSlots()
        return 'conflict'
      }

      submitError.value =
        error?.message || 'Não foi possível enviar a solicitação. Tente novamente.'
      notify.error(submitError.value)
      return 'error'
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
    durationMinutes,
    isReadyToSubmit,
    reload: load,
    reloadPets,
    refreshSlots,
    submit,
  }
}
