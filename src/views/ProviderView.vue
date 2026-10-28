<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AlertTriangle } from 'lucide-vue-next'

import AboutComponent from '@/components/layouts/AboutComponent.vue'
import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue'
import ProviderAvailability from '@/components/provider/ProviderAvailability.vue'
import ReviewList from '@/components/layouts/ReviewList.vue'
import ScheduleButton from '@/components/buttons/ScheduleButton.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useReviewStore } from '@/stores/review'

const providerStore = useProviderStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()
const route = useRoute()
const provider = ref(null)
const status = ref('loading')

const providerId = computed(() => Number(route.params.id))

const isOwnProfile = computed(
  () => !!provider.value?.id && provider.value.id === authStore.user?.provider_profile?.id,
)
const canSchedule = computed(() => authStore.mode === 'client' && !isOwnProfile.value)

watch(
  providerId,
  async (id) => {
    if (!Number.isInteger(id) || id <= 0) {
      status.value = 'error'
      return
    }

    status.value = 'loading'
    provider.value = (await providerStore.fetchProvider(id)) ?? null
    if (!provider.value) {
      status.value = 'error'
      return
    }
    status.value = 'ready'

    await reviewStore.getReviews({ provider_id: id })
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="status === 'loading'"
    aria-busy="true"
    aria-label="Carregando perfil"
    class="flex flex-col gap-6 p-4 md:p-6"
  >
    <UiSkeleton shape="circle" class="size-16" />
    <UiSkeleton :lines="3" />
    <UiSkeleton shape="rect" />
  </div>
  <UiEmptyState
    v-else-if="status === 'error'"
    :icon="AlertTriangle"
    title="Não foi possível carregar este perfil"
    description="Volte e tente novamente em instantes."
  />
  <div v-else class="relative mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 pb-40 md:p-6 md:pb-28">
    <ProviderProfileTop :provider="provider" />
    <AboutComponent :description="provider.description" />
    <ProviderAvailability :slots="provider.availability" />
    <ReviewList />
    <div
      v-if="canSchedule"
      data-testid="schedule-bar"
      class="fixed inset-x-4 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 md:bottom-6 md:left-78 md:right-8"
    >
      <ScheduleButton
        :price="provider.price_per_hour"
        :to="{ name: 'scheduling-view', params: { providerId: provider.id } }"
      />
    </div>
  </div>
</template>
