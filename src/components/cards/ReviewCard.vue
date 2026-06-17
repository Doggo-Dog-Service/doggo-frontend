<script setup>
const props = defineProps({
  review: {
    type: Object,
    required: true,
  },
})
</script>
<template>
  <div class="border rounded-xl p-4">
    <h3 class="font-semibold">
      {{ props.review.client.user.full_name }}
    </h3>
    <p class="text-amber-500">
      {{ props.review.rating }}/5
    </p>
    <p class="mt-2">
      {{ props.review.comment }}
    </p>
  </div>
</template>
