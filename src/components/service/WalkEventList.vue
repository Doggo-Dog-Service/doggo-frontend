<script setup>
import { walkEventMeta } from '@/utils/walkEvents'

defineProps({
  events: { type: Array, required: true },
})

function time(iso) {
  const date = new Date(iso)

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <h2 class="text-subtitle text-fg">Marcadores</h2>
    <ul v-if="events.length > 0" class="flex flex-col gap-2">
      <li
        v-for="event in events"
        :key="event.id"
        data-event-item
        class="flex items-center gap-3 rounded-control border border-line bg-surface px-3 py-2"
      >
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary"
        >
          <component :is="walkEventMeta(event.kind).icon" :size="18" :stroke-width="2" aria-hidden="true" />
        </span>
        <span class="flex-1 text-body font-semibold text-fg">{{ walkEventMeta(event.kind).label }}</span>
        <img
          v-if="event.image_url"
          :src="event.image_url"
          :alt="`Foto do passeio às ${time(event.created_at)}`"
          class="size-10 rounded-control object-cover"
          loading="lazy"
        />
        <time class="text-caption tabular-nums text-fg-muted" :datetime="event.created_at">
          {{ time(event.created_at) }}
        </time>
      </li>
    </ul>
    <p v-else class="text-body text-fg-muted">Nenhum marcador ainda.</p>
  </div>
</template>
