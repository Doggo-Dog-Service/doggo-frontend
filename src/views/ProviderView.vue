<script setup>
import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue';
import InfoBar from '@/components/layouts/InfoBar.vue';
import AboutComponent from '@/components/layouts/AboutComponent.vue';
import { onMounted, ref } from 'vue';
import { useProviderStore } from '@/stores/provider';
import { useRoute } from 'vue-router';


const providerStore = useProviderStore();
const route = useRoute()
const provider = ref({});

onMounted(async () => {
  const response = await providerStore.fetchProvider(Number(route.params.id))
  provider.value = response
  console.log(provider.value)
})
</script>
<template>
  <div class="flex flex-col gap-5 p-6">
    <ProviderProfileTop :provider="provider"/>
    <InfoBar/>
    <AboutComponent :provider="provider.description"/>
  </div>
</template>
