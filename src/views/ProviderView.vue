<script setup>
import ProviderProfileTop from '@/components/layouts/ProviderProfileTop.vue';
import { onMounted, ref } from 'vue';
import { useProviderStore } from '@/stores/provider';
import { useRoute } from 'vue-router';

const providerStore = useProviderStore();
const route = useRoute()
const provider = ref();

onMounted(async () => {
  const newProvider = await providerStore.fetchProvider(Number(route.params.id))
  console.log(newProvider)
  provider.value = newProvider
})
</script>
<template>
  <p>{{ provider?.id }}</p>
  <ProviderProfileTop :provider="provider"/>
</template>
