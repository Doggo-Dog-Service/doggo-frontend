<script setup>
    const props = defineProps({
        info: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
    })
</script>

<template>
    <div class="flex flex-col items-center justify-center w-full p-2 bg-white border-2 border-doggo-gray rounded-2xl active:scale-98 transition-all duration-200 ease-in-out">
        <p class="text-2xl text-doggo-green font-bold">{{ props.info }}</p>
        <p class="text-doggo-black/50">{{ props.description }}</p>
    </div>
</template>