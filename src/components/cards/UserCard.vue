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
  service_name: {
    type: String,
    required: true,
  },
  fixed_latitude: {
    type: String,
    required: true,
  },
  fixed_longitude: {
    type: String,
    required: true,
  },
  price_per_hour: {
    type: String,
    default: '',
  },
  price_per_day: {
    type: String,
    default: '',
  },
  is_active: {
    type: Boolean,
    required: true,
  },
})
</script>

<template>
  <RouterLink
    class="w-full flex justify-between bg-white p-4 border border-doggo-gray rounded-xl transition-all duration-200 active:scale-98 active:opacity-70 hover:scale-99"
    to="/"
  >
    <div class="flex items-center gap-4">
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
      <div>
        <h3 class="text-base font-semibold truncate w-40">{{ props.full_name }}</h3>
        <div class="flex text-sm text-zinc-400 gap-2">
          <span class="mdi mdi-briefcase-variant"></span>
          <p>{{ props.service_name }}</p>
        </div>
        <div class="flex text-sm gap-1">
          <span class="mdi mdi-star text-amber-400"></span>
          <p class="font-semibold">5,0</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col justify-between items-end">
      <div
        :class="[
          'flex items-center gap-1 text-sm rounded-full px-2',
          props.is_active ? 'text-doggo-green' : 'text-red-700',
        ]"
      >
        <span class="mdi mdi-circle text-[10px]"></span>
        <p>{{ props.is_active ? 'Online' : 'Offline' }}</p>
      </div>
      <p v-if="props.price_per_hour" class="text-doggo-green text-sm font-semibold">
        R$ {{ props.price_per_hour }}/h
      </p>
      <p v-else-if="props.price_per_day" class="text-doggo-green text-sm font-semibold">
        R$ {{ props.price_per_day }}/d
      </p>
      <p v-else class="text-doggo-green text-sm font-semibold">
        indefinido
      </p>
    </div>
  </RouterLink>
</template>
