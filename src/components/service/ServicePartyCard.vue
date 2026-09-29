<script setup>
import { computed } from 'vue'

import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

const store = useServiceWebSocketStore()

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const party = computed(() => {
  if (props.role === 'provider') {
    return {
      name: store.clientName,
      picture: store.clientPicture,
      link: null,
    }
  }

  return {
    name: store.providerName,
    picture: store.providerPicture,
    link: `/provider/${store.providerId}`,
  }
})

const initial = computed(() => party.value.name?.charAt(0)?.toUpperCase() ?? '')
</script>

<template>
  <RouterLink
    v-if="party.link"
    :to="party.link"
    class="relative w-full flex items-start justify-between bg-white border border-doggo-gray rounded-xl p-3 transition-all duration-200 hover:scale-99"
  >
    <div class="flex items-center gap-4">
      <img
        v-if="party.picture"
        class="h-10 w-10 rounded-lg object-cover md:h-12 md:w-12"
        :src="party.picture"
        :alt="`${party.name}-photo`"
      />
      <div
        v-else
        class="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-doggo-light-green text-doggo-green md:h-12 md:w-12"
      >
        <p class="text-base font-semibold">{{ initial }}</p>
      </div>
      <div class="flex flex-col min-w-0">
        <p class="truncate max-w-40">{{ party.name }}</p>
        <p class="text-doggo-black/50 text-sm truncate max-w-40">{{ store.serviceType }}</p>
      </div>
    </div>
    <span class="bg-doggo-light-green text-doggo-green text-sm border rounded-full px-2 truncate max-w-28">
      {{ store.serviceType }}
    </span>
  </RouterLink>

  <div v-else class="relative w-full flex items-start justify-between bg-white border border-doggo-gray rounded-xl p-3">
    <div class="flex items-center gap-4">
      <img
        v-if="party.picture"
        class="h-10 w-10 rounded-lg object-cover md:h-12 md:w-12"
        :src="party.picture"
        :alt="`${party.name}-photo`"
      />
      <div
        v-else
        class="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-doggo-light-green text-doggo-green md:h-12 md:w-12"
      >
        <p class="text-base font-semibold">{{ initial }}</p>
      </div>
      <div class="flex flex-col min-w-0">
        <p class="truncate max-w-40">{{ party.name }}</p>
        <p class="text-doggo-black/50 text-sm truncate max-w-40">{{ store.serviceType }}</p>
      </div>
    </div>
    <span class="bg-doggo-light-green text-doggo-green text-sm border rounded-full px-2 truncate max-w-28">
      {{ store.serviceType }}
    </span>
  </div>
</template>