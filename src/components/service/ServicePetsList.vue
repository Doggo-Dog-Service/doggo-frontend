<script setup>
import PetCard from '@/components/cards/PetCard.vue'

import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

const store = useServiceWebSocketStore()
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <h2 class="font-semibold">Pets no passeio:</h2>
    <ul v-if="store.pets.length > 0" class="grid grid-cols-2 gap-2">
      <li v-for="pet in store.pets" :key="pet.id">
        <PetCard :name="pet.name" :pet_picture="pet.pet_picture" :breed="pet.breed" />
      </li>
    </ul>
    <p v-else class="text-sm text-doggo-black/50">Nenhum pet incluído neste passeio.</p>
  </div>
</template>