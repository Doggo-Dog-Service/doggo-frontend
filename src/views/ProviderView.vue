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
  const response = await providerStore.fetchProvider(Number(route.params.id))
  provider.value = response
  console.log(provider.value)
})
onMounted(async () => {
  const response = await providerStore.fetchProvider(Number(route.params.id))

  console.log('Response completa:', response)
  console.log('Provider:', JSON.stringify(response, null, 2))

  provider.value = response
})
</script>
<template>
  <div class="flex flex-col gap-5 p-6">
    <ProviderProfileTop :provider="provider" />
    <InfoBar />
    <AboutComponent :description="provider.description" />
    <div v-if="provider?.user">
      <ScheduleButton :text="provider?.user?.full_name" :price="provider?.price_per_hour" />
    </div>
  </div>
</template>
