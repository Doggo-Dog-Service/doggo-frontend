<script setup>
defineProps({
  full_name: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  profile_photo: {
    type: String,
    default: '',
  },
  service: {
    type: String,
    default: 'Usuário',
  },
  classification: {
    type: [Number, String],
    default: '',
  },
  link: {
    type: String,
    default: '#',
  },
})
</script>
<template>
  <RouterLink
    :to="link"
    class="relative w-full flex items-start justify-between bg-white border border-doggo-gray rounded-xl p-3 transition-all duration-200 hover:scale-99"
  >
    <div class="flex items-center gap-4 md:gap-4">
      <img
        v-if="profile_photo"
        class="h-10 w-10 rounded-lg object-cover md:h-12 md:w-12"
        :src="profile_photo"
        :alt="`${full_name.toLowerCase()}-photo`"
      />
      <div
        v-else
        class="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-doggo-light-green md:h-12 md:w-12"
      >
        <p class="text-white text-base">{{ full_name[0] }}</p>
      </div>
      <div class="flex flex-col min-w-0">
        <p class="truncate max-w-40">{{ full_name }}</p>
        <div class="flex items-center gap-2" v-if="classification">
          <span class="mdi mdi-star text-yellow-400 shrink-0"></span>
          <p>{{ classification }}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center shrink-0 ml-2">
      <span class="bg-doggo-light-green text-doggo-green text-sm border rounded-full px-2 truncate max-w-28">
        {{ service }}
      </span>
    </div>
  </RouterLink>
</template>
