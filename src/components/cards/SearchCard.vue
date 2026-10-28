<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'

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
    class="flex w-full items-center justify-between gap-2 rounded-control border border-line bg-surface p-3 transition-colors duration-200 hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary"
  >
    <div class="flex min-w-0 items-center gap-3">
      <UiAvatar :src="props.profile_photo" :name="props.full_name" />
      <div class="flex min-w-0 flex-col">
        <p class="truncate text-body font-semibold text-fg">{{ props.full_name }}</p>
        <div class="flex items-center gap-1 text-caption text-fg-muted" v-if="props.classification">
          <Star :size="14" :stroke-width="2" fill="currentColor" class="shrink-0 text-warning" aria-hidden="true" />
          <p>{{ props.classification }}</p>
        </div>
      </div>
    </div>
    <UiBadge tone="brand" class="max-w-28 shrink-0 truncate">{{ props.service }}</UiBadge>
  </RouterLink>
</template>
