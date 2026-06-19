<script setup>
const props = defineProps({
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
    required: false,
  },
  service: {
    type: String,
    default: 'Usuário',
  },
  classification: {
    type: String,
    required: false,
  },
})
</script>
<template>
  <RouterLink
    :to="`/provider/${props.id}`"
    class="relative w-full flex items-start justify-between bg-white border border-doggo-gray rounded-xl p-3 transition-all duration-200 hover:scale-99"
  >
    <div class="flex items-center gap-2 md:gap-4">
      <img
        v-if="props.profile_photo"
        class="h-10 w-10 rounded-lg object-cover md:h-12 md:w-12"
        :src="props.profile_photo"
        :alt="`${props.full_name.toLowerCase()}-photo`"
      />
      <div
        v-else
        class="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-doggo-light-green md:h-12 md:w-12"
      >
        <p class="text-white text-base">{{ props.full_name.charAt() }}</p>
      </div>
      <div class="flex flex-col">
        <p>{{ props.full_name }}</p>
        <div class="flex items-center gap-2" v-if="props.classification">
          <span class="mdi mdi-star text-yellow-400"></span>
          <p>{{ props.classification }}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center">
      <span class="bg-doggo-light-green text-doggo-green text-sm border rounded-full px-2">
        {{ props.service }}
      </span>
    </div>
  </RouterLink>
</template>
