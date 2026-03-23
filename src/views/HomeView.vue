<script setup>
import InfoCard from '@/components/cards/InfoCard.vue'
import ServicesCard from '@/components/cards/ServicesCard.vue'
import SearchBar from '@/components/inputs/SearchBar.vue'

const services = [
  {
    title: 'Dog Boarding',
    description: 'Casa temporária para o pet enquant estiver fora',
    icon: 'mdi mdi-bell',
    type: 'yellow',
    link: '/'
  },
  {
    title: 'Dog Sitter',
    description: 'Cuidador do pet na sua própria casa',
    icon: 'mdi mdi-home',
    type: 'green',
    link: '/'
  },
  {
    title: 'Dog Walking',
    description: 'Passeio para os pets gastarem a energia, caso sua rotina esteja muito corrida',
    icon: 'mdi mdi-paw',
    type: 'default',
    link: '/'
  },
]
</script>
<template>
  <div class="flex flex-col gap-5 text-doggo-black md:grid md:grid-cols-2 md:gap-10 md:items-end">
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
  </div>
</template>
