<script setup>
import { onMounted, ref } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useReviewStore } from '@/stores/review'
import { useRoute } from 'vue-router'

import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue'
import InfoBar from '@/components/layouts/InfoBar.vue'
import AboutComponent from '@/components/layouts/AboutComponent.vue'
import ScheduleButton from '@/components/buttons/ScheduleButton.vue'
import ReviewList from '@/components/layouts/ReviewList.vue'

const providerStore = useProviderStore()
const reviewStore = useReviewStore()
const route = useRoute()
const provider = ref(null)

onMounted(async () => {
  const response = await providerStore.fetchProvider(Number(route.params.id))
  await reviewStore.getReviews({ provider_id: Number(route.params.id) })
  provider.value = response
})
</script>

<template>
  <div v-if="provider" class="relative grid gap-10 w-full p-6 pb-28 md:grid-cols-2">
    <ProviderProfileTop :provider="provider" />
    <InfoBar/>
    <AboutComponent :description="provider.description" />
    <ReviewList/>
    <ScheduleButton
      :text="provider.full_name"
      :price="provider.price_per_hour"
      class="fixed bottom-4 left-4 right-4 z-50 md:left-75 md:2-1/3"
    />
  </div>
</template>
