<script setup>
const emits = defineEmits(['click'])

const props = defineProps({
  pet_picture: {
    type: String,
    default: '',
  },
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <button
    :class="[
      'relative w-full flex flex-col rounded-xl bg-white border-b-2 border-doggo-gray text-justify cursor-pointer transition-all duration-200 hover:scale-98 active:scale-98 active:opacity-70',
      props.selected && 'opacity-70',
    ]"
    type="button"
    @click="emits('click')"
  >
    <div class="relative">
      <img
        v-if="props.pet_picture"
        :src="props.pet_picture"
        alt="pet-picture"
        class="w-full aspect-[4/3] object-cover rounded-t-xl"
      />
      <div
        v-else
        class="aspect-[4/3] grid justify-center items-center bg-doggo-green/20 rounded-t-xl"
      >
        <span class="mdi mdi-dog text-doggo-green text-4xl md:text-5xl"></span>
      </div>
      <span
        v-if="props.selected"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <span
          class="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-white/70"
        >
          <span
            class="mdi mdi-check-circle text-doggo-green text-4xl md:text-5xl leading-none"
          ></span>
        </span>
      </span>
    </div>
    <div class="p-3 md:p-4">
      <p class="text-base md:text-xl font-semibold">{{ props.name }}</p>
      <p class="text-sm md:text-base text-gray-500 font-semibold">
        <span class="mdi mdi-paw"></span> {{ props.breed }}
      </p>
    </div>
  </button>
</template>
