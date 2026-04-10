<script setup>
const user = {
  id: 1,
  full_name: 'Luiz Roberto',
  profile_photo: 'https://cdn.pixabay.com/photo/2020/10/04/10/43/horse-5625922_640.jpg',
  location_home: 'Araquari-Joiville,SC',
}
</script>
<template>
  <img src="/public/imgBanner.png" alt="banner" class="w-full h-full object-cover z-0" />
  <img
    v-if="user.profile_photo"
    class="h-22 w-22 rounded-2xl z-1 border-white border-4 -translate-y-16 translate-x-8"
    :src="user.profile_photo"
    :alt="`${user.full_name.toLowerCase()}-photo`"
  />
  <div
    v-else
    class="flex flex-col items-center justify-center h-22 w-22 rounded-2xl bg-linear-to-r from-doggo-green to-doggo-light-green z-1 border-white border-2 -translate-y-16 translate-x-8"
  >
    <p class="text-white text-xl">
      {{ user.full_name.charAt() }}
    </p>
  </div>
  <p class="text-black -translate-y-22 ml-35 text-2xl font-bold">
    {{ user.full_name }}
  </p>
  <div class="flex flex-nowrap w-1/3">
    <p class="whitespace-nowrap ml-56 -translate-22 text-gray-400">
      <span class="mdi mdi-map-marker"></span>
      {{ user.location_home }}
    </p>
    <button
      class="ml-8 -translate-24 border rounded-4xl px-3 py-1 font-bold text-doggo-green bg-green-100"
    >
      Editar
    </button>
  </div>
</template>
