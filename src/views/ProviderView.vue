<script setup>
import { onMounted, ref } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useRoute } from 'vue-router'

import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue'
import InfoBar from '@/components/layouts/InfoBar.vue'
import AboutComponent from '@/components/layouts/AboutComponent.vue'
import ScheduleButton from '@/components/buttons/ScheduleButton.vue'
import ReviewList from '@/components/layouts/ReviewList.vue'

const providerStore = useProviderStore()
const route = useRoute()
const provider = ref({})

onMounted(async () => {
  const response = await providerStore.fetchProvider(
    Number(route.params.id)
  )

  provider.value = response

  console.log(provider.value.reviews)
})
</script>
<template>
  <div class="flex flex-col gap-10 p-4 sm:p-6 pb-28 w-full max-w-5xl mx-auto">
    <ProviderProfileTop :provider="provider" />
    <InfoBar />
    <AboutComponent :description="provider.description" />
    <ReviewList :reviews="provider.reviews" />
    <div v-if="provider?.user">
      <ScheduleButton
        :text="provider?.user?.full_name"
        :price="provider?.price_per_hour"
        class="fixed bottom-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-50"
      />
    </div>
  </div>
</template>
