<script setup>
import { useLocation } from '@/composables/useLocation'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
const authStore = useAuthStore()

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
})

const { cityName, setLocation } = useLocation()

onMounted(async () => {
  await setLocation(Number(props.provider.fixed_latitude), Number(props.provider.fixed_longitude))
})
</script>
<template>
  <div class="flex flex-col sm:flex-row justify-between gap-4">
    <div class="flex gap-5">
      <img
        v-if="props.provider.profile_picture"
        class="w-22 h-22 object-cover rounded-2xl shrink-0"
        :src="props.provider.profile_picture"
        alt="profile-photo"
      />
      <div
        v-else
        class="flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-doggo-light-green border-white border-2 shrink-0"
      >
        <p class="text-white text-2xl">
          {{ props.provider.full_name.charAt(0) }}
        </p>
      </div>
      <div class="min-w-0">
        <h1 class="text-lg sm:text-xl font-semibold wrap-break-word">
          {{ props.provider.full_name }}
        </h1>
        <div class="flex items-start gap-1 text-gray-400">
          <span class="mdi mdi-map-marker text-doggo-green"></span>
          <p class="truncate">
            {{ cityName }}
          </p>
        </div>
        <div class="flex items-start gap-1 text-gray-400">
          <span class="mdi mdi-briefcase-variant text-doggo-green"></span>
          <p class="truncate">
            {{ props.provider.service_type_name }}
          </p>
        </div>
      </div>
    </div>
    <button
      v-if="authStore.user?.id === props.provider.user?.id"
      class="self-start sm:self-center border rounded-full px-4 py-2 font-bold text-doggo-green bg-green-100 whitespace-nowrap"
    >
      Editar
    </button>
  </div>
</template>
