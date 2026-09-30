<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import AboutComponent from '@/components/layouts/AboutComponent.vue'
import InfoBar from '@/components/layouts/InfoBar.vue'
import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue'
import ReviewList from '@/components/layouts/ReviewList.vue'
import ScheduleButton from '@/components/buttons/ScheduleButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useProviderStore } from '@/stores/provider'
import { useReviewStore } from '@/stores/review'

const providerStore = useProviderStore()
const reviewStore = useReviewStore()
const authStore = useAuthStore()
const route = useRoute()
const provider = ref(null)

const providerId = computed(() => Number(route.params.id))

const isOwnProfile = computed(
  () => !!provider.value?.user?.id && provider.value.user.id === authStore.user?.id,
)

watch(
  providerId,
  async (id) => {
    if (!Number.isInteger(id) || id <= 0) return

    provider.value = await providerStore.fetchProvider(id)

    await reviewStore.getReviews({ provider_id: id })
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="provider" class="relative grid gap-10 w-full p-6 pb-28 md:grid-cols-2">
    <ProviderProfileTop :provider="provider" />
    <InfoBar />
    <AboutComponent :description="provider.description" />
    <ReviewList />
    <ScheduleButton
      v-if="!isOwnProfile"
      :text="provider.full_name"
      :price="provider.price_per_hour"
      :to="`/scheduling/${provider.id}`"
      class="fixed bottom-4 left-4 right-4 z-50 md:left-75 md:2-1/3"
    />
  </div>
</template>
