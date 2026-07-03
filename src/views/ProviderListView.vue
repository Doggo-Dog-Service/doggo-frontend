<script setup>
import UserCard from '@/components/cards/UserCard.vue';
import { useProviderStore } from '@/stores/provider';
import { onMounted } from 'vue';

const providerStore = useProviderStore();
onMounted(async() => {
  await providerStore.fetchProviders()
})
</script>
<template>
  <div class="flex flex-col gap-y-10 mx-auto px-2 py-8">
    <div class="">
      <h1 class="text-4xl text-center">
        Pr<span class="text-doggo-green">o</span>fissionais
      </h1>
      <button class="bg-white border border-doggo-gray px-3 py-3 rounded-2xl ">
        Filtrar
        <span class="mdi mdi-filter"></span>
      </button>
    </div>
    <div class="flex flex-col gap-y-5">
      <UserCard
        v-for="provider in providerStore.providers"
        :key="provider.id"
        :id="provider.id"
        :full_name="provider.user.full_name"
        :service_name="provider.service_type_detail.name"
        :fixed_latitude="provider.fixed_latitude"
        :fixed_longitude="provider.fixed_longitude"
        :price_per_hour="provider.price_per_hour"
        :price_per_day="provider.price_per_day"
        :is_active="provider.is_active"
        :profile_photo="provider.user.profile_picture?.url"
      />
    </div>
  </div>
</template>
