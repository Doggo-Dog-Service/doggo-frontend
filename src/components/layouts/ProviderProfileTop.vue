<script setup>
import gsap from "gsap";
import { onMounted } from "vue";

onMounted(() => {
  const blobs = gsap.utils.toArray('.blob');

  blobs.forEach((blob, i) => {
    gsap.to(blob, {
      x: () => gsap.utils.random(-400, 400),
      y: () => gsap.utils.random(-200, 200),
      scale: () => gsap.utils.random(0.8, 1.4),
      duration: () => gsap.utils.random(6, 12),
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.5
    })
  })
})

const user = {
  id: 1,
  full_name: 'Luiz Roberto',
  profile_photo: 'https://cdn.pixabay.com/photo/2020/10/04/10/43/horse-5625922_640.jpg',
  location_home: 'Araquari-Joiville,SC',
}
</script>
<template>
  <div class="bg-doggo-green h-80 relative overflow-hidden">
    <div class="absolute inset-0">
      <div :class="['blob', 'absolute top-0 left-0 w-100 h-100 rounded-full opacity-60 bg-white/5']"></div>
      <div :class="['blob', 'absolute top-0 left-0 w-100 h-100 rounded-full opacity-60 bg-white/5']"></div>
      <div :class="['blob', 'absolute bottom-0 left-0 w-100 h-100 rounded-full opacity-60 bg-white/5']"></div>
      <div :class="['blob', 'absolute bottom-0 right-0 w-100 h-100 rounded-full opacity-60 bg-white/5']"></div>
    </div>
  </div>
  <img
    v-if="user.profile_photo"
    class="h-22 w-22 rounded-2xl z-1 border-white border-4 -translate-y-12 translate-x-6"
    :src="user.profile_photo"
    :alt="`${user.full_name.toLowerCase()}-photo`"
  />
  <div
    v-else
    class="flex flex-col items-center justify-center h-22 w-22 rounded-2xl bg-linear-to-r from-doggo-green to-doggo-light-green z-1 border-white border-2 -translate-y-12 translate-x-8"
  >
    <p class="text-white text-xl">
      {{ user.full_name.charAt() }}
    </p>
  </div>
  <p class="text-black -translate-y-21 ml-30 text-2xl font-bold">
    {{ user.full_name }}
  </p>
  <div class="flex flex-nowrap w-1/3">
    <p class="whitespace-nowrap ml-51 -translate-22 text-gray-400">
      <span class="mdi mdi-map-marker"></span>
      {{ user.location_home }}
    </p>
    <button
      class="ml-8 -translate-24 border rounded-4xl px-3 py-1 font-bold text-doggo-green bg-green-100"
    >
      Editar
    </button>
  </div>
  <div class="bg-background-light border border-doggo-gray rounded-2xl h-40 mx-2">
    <div class="">

    </div>
    <div>

    </div>
    <div>

    </div>
  </div>
</template>
