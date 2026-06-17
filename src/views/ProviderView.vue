<script setup>
import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue'
import InfoBar from '@/components/layouts/InfoBar.vue'
import AboutComponent from '@/components/layouts/AboutComponent.vue'
import { onMounted, ref } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useRoute } from 'vue-router'
import ScheduleButton from '@/components/buttons/ScheduleButton.vue'

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
  <div class="flex flex-col gap-5 p-6">
    <ProviderProfileTop :provider="provider" />
    <InfoBar />
    <AboutComponent :description="provider.description" />
    <div v-if="provider?.user" class="">
      <ScheduleButton
      :text="provider?.user?.full_name"
      :price="provider?.price_per_hour"
      class="fixed bottom-4 left-4 right-4 z-50"/>
    </div>
    <div
      v-if="provider.reviews?.length"
      class="flex flex-col gap-4"
    >
      <h2 class="text-xl font-bold">
        Avaliações
      </h2>
      <ReviewCard
        v-for="review in provider.reviews"
        :key="review.id"
        :review="review"
      />
    </div>
  </div>
</template>
