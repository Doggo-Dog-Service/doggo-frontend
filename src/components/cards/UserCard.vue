<script setup>
import AppButton from '../buttons/AppButton.vue';

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  profile_photo: {
    type: String,
    default: '',
  },
  full_name: {
    type: String,
    required: true,
  },
  service_type: {
    type: Object,
    required: true,
    validator: (service) => ['walker', 'sitter', 'boarding'].includes(service.name),
  },
  location: {
    type: Object,
    required: true,
  },
  price_per_hour: {
    type: Number,
    default: 0,
  },
  price_per_day: {
    type: Number,
    default: 0,
  },
  classification: {
    type: Number,
    default: 0,
  },
})
</script>

<template>
  <RouterLink
    class="w-full flex flex-col gap-2 border-2 border-doggo-gray p-4 rounded-xl transition-all duration-200 active:scale-98"
    to="/"
  >
    <div class="w-full flex justify-between items-center border-b-2 border-doggo-gray pb-4">
      <div class="flex gap-5">
        <img
          v-if="props.profile_photo"
          class="h-15 w-15 rounded-xl"
          :src="props.profile_photo"
          :alt="`${props.full_name.toLowerCase()}-photo`"
        />
        <div
          v-else
          class="flex flex-col items-center justify-center h-15 w-15 rounded-xl bg-doggo-light-green"
        >
          <p class="text-white text-xl">{{ props.full_name.charAt() }}</p>
        </div>
        <div class="flex flex-col">
          <h3 class="text-doggo-black text-lg font-semibold">{{ props.full_name }}</h3>
          <p>
            <span class="mdi mdi-map-marker text-doggo-green"></span>
            {{ location.latitude }} km
            <!--substituir por função de cálculo de quilometragem -->
          </p>
        </div>
      </div>
      <div class="flex flex-col gap-2">
        <div class="text-doggo-green text-lg font-bold">
          <p v-if="props.price_per_hour" >R$ {{ props.price_per_hour }}/h</p>
          <p v-else >R$ {{ props.price_per_day }}/d</p>
        </div>
        <span
          class="bg-doggo-light-green/30 border-2 border-doggo-light-green text-doggo-green min-w-20 text-center rounded-full py-1"
          >{{ props.service_type.name }}</span
        >
      </div>
    </div>
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="mdi mdi-star text-amber-300 text-lg"></span>
        <p class="text-doggo-black font-semibold text-lg">{{ props.classification.toFixed(1).replace('.', ',') }}</p>
      </div>
      <AppButton text="Agendar" mode="outline"/>
    </div>
  </RouterLink>
</template>
