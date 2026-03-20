<script setup>
    import InfoCard from '@/components/cards/InfoCard.vue';
    import SearchBar from '@/components/inputs/SearchBar.vue';
</script>
<template>
  <div class="">
    <section class="flex flex-col gap-4 md:w-100">
        <div class="flex flex-col">
            <h1 class="text-2xl font-bold text-doggo-black">Olá André 👋</h1>
            <h1 class="text-2xl font-bold text-doggo-black">O que seu <span class="text-doggo-green">pet</span> precisa?</h1>
            <p class="text-doggo-black/50 font-semibold">Encontre profissionais de confiança perto de você.</p>
        </div>
        <div class="grid grid-cols-3 gap-4">
            <SearchBar class="col-span-3" placeholder="Buscar profissionais ou serviços…"/>
            <InfoCard info="247" description="Profissionais"/>
            <InfoCard info="4.5" description="Avaliação"/>
            <InfoCard info="1200" description="Pets"/>
        </div>
    </section>
  </div>
</template>