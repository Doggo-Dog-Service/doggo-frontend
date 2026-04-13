<script setup>
import InfoCard from '@/components/cards/InfoCard.vue'
import ServicesCard from '@/components/cards/ServicesCard.vue'
import SearchBar from '@/components/inputs/SearchBar.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import UserCard from '@/components/cards/UserCard.vue'
import { onMounted } from 'vue'
import { useProviderStore } from '@/stores/provider'
const providerStore = useProviderStore()

const services = [
  {
    title: 'Dog Boarding',
    description: 'Casa temporária para o pet enquant estiver fora',
    icon: 'mdi mdi-bell',
    type: 'yellow',
    link: '/',
  },
  {
    title: 'Dog Sitter',
    description: 'Cuidador do pet na sua própria casa',
    icon: 'mdi mdi-home',
    type: 'green',
    link: '/',
  },
  {
    title: 'Dog Walking',
    description: 'Passeio para os pets gastarem a energia, caso sua rotina esteja muito corrida',
    icon: 'mdi mdi-paw',
    type: 'default',
    link: '/',
  },
]

onMounted(async () => {
  await providerStore.fetchProviders()
})
</script>
<template>
  <div
    class="flex flex-col gap-5 p-6 text-doggo-black md:flex-wrap md:gap-10 md:justify-end md:max-h-screen"
  >
    <section class="flex flex-col gap-4">
      <div class="flex flex-col">
        <h1 class="text-2xl font-bold">Olá André 👋</h1>
        <h1 class="text-2xl font-bold">
          O que seu <span class="text-doggo-green">pet</span> precisa?
        </h1>
        <p class="text-doggo-black/50 font-semibold">
          Encontre profissionais de confiança perto de você.
        </p>
      </div>
      <div class="grid grid-cols-3 gap-4">
        <SearchBar class="col-span-3" placeholder="Buscar profissionais ou serviços…" />
        <InfoCard info="247" description="Profissionais" />
        <InfoCard info="4.5" description="Avaliação" />
        <InfoCard info="1200" description="Pets" />
      </div>
    </section>
    <section class="flex flex-col gap-2">
      <h2 class="text-lg font-bold">Serviços</h2>
      <div class="grid grid-cols-2 gap-2">
        <ServicesCard
          v-for="(service, index) in services"
          :key="index"
          :title="service.title"
          :description="service.description"
          :icon="service.icon"
          :type="service.type"
          :class="[index === services.length - 1 && 'col-span-2']"
        />
      </div>
    </section>
    <section class="flex flex-col gap-4">
      <h2 class="text-lg font-bold">Perto de você</h2>
      <div class="flex gap-2">
        <AppButton text="Walkers" :selected="providerStore.currentService === 'walker'" />
        <AppButton text="Sitters" :selected="providerStore.currentService === 'sitter'" />
        <AppButton text="Boarding" :selected="providerStore.currentService === 'boarding'" />
      </div>
      <div
        class="flex flex-col gap-2 h-110 md:overflow-y-auto"
        v-if="providerStore.providers.length > 0"
      >
        <UserCard
          v-for="(provider, index) of providerStore.providers"
          :key="index"
          :id="provider.id"
          :full_name="provider.full_name"
          :service_type="provider.service_type"
          :location="provider.location"
          :price_per_day="provider.price_per_day"
          :price_per_hour="provider.price_per_hour"
          :profile_photo="provider.profile_photo"
          :classification="provider.classification"
        />
      </div>
      <div class="text-center h-110 flex flex-col items-center justify-center">
        <p class="text-xl text-doggo-green font-semibold md:text-base">
          Não conseguimos encontrar nenhum provedor perto da sua região
        </p>
      </div>
    </section>
  </div>
</template>
