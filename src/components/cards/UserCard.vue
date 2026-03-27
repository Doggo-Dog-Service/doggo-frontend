<script setup>
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
  <RouterLink class="border-2 border-doggo-gray p-4 rounded-xl" to="/">
    <div class="flex gap-5">
      <img
        v-if="props.profile_photo"
        class="w-20 h-20"
        :src="props.profile_photo"
        :alt="`${props.full_name}-profile_photo`"
      />
      <div
        v-else
        class="text-white text-xl bg-doggo-light-green w-15 h-15 rounded-xl flex items-center justify-center"
      >
        {{ props.full_name.charAt(0) }}
      </div>
      <div class="flex justify-between w-3/4">
        <div class="flex flex-col items-start gap-1">
          <h3 class="font-semibold text-lg">{{ props.full_name }}</h3>
          <div class="flex">
            <span class="mdi mdi-map-marker text-doggo-green"></span>
            <p>{{ props.location.latitude }} km</p>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <p v-if="props.price_per_hour" class="text-doggo-green font-bold">R$ {{ props.price_per_hour }}/h</p>
          <p v-else class="text-doggo-green font-bold">R$ {{ props.price_per_day }}/dia</p>
          <span
            class="bg-doggo-light-green/20 border-2 border-doggo-light-green text-doggo-green px-2 rounded-xl"
          >
            {{ props.service_type.name }}
          </span>
        </div>
      </div>
    </div>
    <div></div>
  </RouterLink>
</template>
