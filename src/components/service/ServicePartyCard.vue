<script setup>
import { computed } from 'vue'

import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { useServiceWebSocketStore } from '@/stores/serviceWebSocket'

const store = useServiceWebSocketStore()

const props = defineProps({
  role: {
    type: String,
    required: true,
  },
})

const party = computed(() => {
  if (props.role === 'provider') {
    return {
      name: store.clientName,
      picture: store.clientPicture,
      link: null,
    }
  }

  return {
    name: store.providerName,
    picture: store.providerPicture,
    link: `/provider/${store.providerId}`,
  }
})
</script>

<template>
  <component
    :is="party.link ? 'RouterLink' : 'div'"
    :to="party.link ?? undefined"
    :class="[
      'flex w-full items-center justify-between gap-3 rounded-card border border-line bg-surface p-3 shadow-card',
      party.link &&
        'transition-colors hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary',
    ]"
  >
    <div class="flex min-w-0 items-center gap-3">
      <UiAvatar :src="party.picture" :name="party.name ?? ''" size="md" />
      <div class="flex min-w-0 flex-col">
        <p class="truncate text-body font-semibold text-fg">{{ party.name }}</p>
        <p class="truncate text-caption text-fg-muted">{{ store.serviceType }}</p>
      </div>
    </div>
    <UiBadge tone="brand" class="max-w-28 shrink-0 truncate">{{ store.serviceType }}</UiBadge>
  </component>
</template>
