<script setup>
import { computed } from 'vue'
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

const to = computed(() => {
  if (props.id) return `${props.link}${props.id}/`

  return props.link
})
</script>
<template>
  <RouterLink
    :to="to"
    class="relative w-full flex items-start justify-between bg-white border border-doggo-gray rounded-xl p-3 transition-all duration-200 hover:scale-99"
  >
    <div class="flex items-center gap-4 md:gap-4">
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
        <p class="text-white text-base">{{ props.full_name[0] }}</p>
      </div>
      <div class="flex flex-col min-w-0">
        <p class="truncate max-w-40">{{ props.full_name }}</p>
        <div class="flex items-center gap-2" v-if="props.classification">
          <span class="mdi mdi-star text-yellow-400 shrink-0"></span>
          <p>{{ props.classification }}</p>
        </div>
      </div>
    </div>
    <div class="flex items-center shrink-0 ml-2">
      <span
        class="bg-doggo-light-green text-doggo-green text-sm border rounded-full px-2 truncate max-w-28"
      >
        {{ props.service }}
      </span>
    </div>
  </RouterLink>
</template>
