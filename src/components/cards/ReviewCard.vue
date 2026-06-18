<script setup>
const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})
</script>
<template>
  <div class="bg-white border border-doggo-gray px-6 py-6 rounded-2xl">
    <div class="flex gap-4 items-start">
      <img
        v-if="props.review.client.user.profile_picture"
        :src="props.review.client.user.profile_picture.file"
        alt="profile-picture"
        class="w-12 h-12 rounded-full object-cover"
      />
      <div
        v-else
        class="flex items-center justify-center w-12 h-12 rounded-xl bg-doggo-light-green text-white font-semibold text-lg shrink-0"
      >
        {{ props.review.client.user.full_name.charAt(0) }}
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold">
          {{ props.review.client.user.full_name }}
        </h3>
        <div class="flex mt-1">
          <span
            v-for="star in 5"
            :key="star"
            :class="
              star <= props.review.rating
                ? 'mdi mdi-star text-amber-500'
                : 'mdi mdi-star-outline text-gray-300'
            "
          />
        </div>
      </div>
    </div>
    <p class="mt-4 wrap-break-word whitespace-pre-wrap">
      {{ props.review.comment }}
    </p>
  </div>
</template>
