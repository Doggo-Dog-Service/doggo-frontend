<script setup>
import { computed } from 'vue'
import { CalendarClock } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'

// slots: lista `availability` do ProviderDetailSerializer
// ({ weekday, weekday_label, start_time, end_time }).
const props = defineProps({
  slots: {
    type: Array,
    default: () => [],
  },
})

const hhmm = (time) => String(time).slice(0, 5)

const days = computed(() => {
  const byDay = new Map()
  for (const slot of props.slots) {
    if (!byDay.has(slot.weekday)) {
      byDay.set(slot.weekday, { weekday: slot.weekday, label: slot.weekday_label, ranges: [] })
    }
    byDay.get(slot.weekday).ranges.push({
      id: slot.id,
      text: `${hhmm(slot.start_time)} – ${hhmm(slot.end_time)}`,
      start: slot.start_time,
    })
  }
  return [...byDay.values()]
    .sort((a, b) => a.weekday - b.weekday)
    .map((day) => ({ ...day, ranges: day.ranges.sort((a, b) => a.start.localeCompare(b.start)) }))
})
</script>

<template>
  <section>
    <h2 class="text-title text-fg">Disponibilidade</h2>
    <ul v-if="days.length" class="mt-3 divide-y divide-line rounded-card border border-line bg-surface shadow-card">
      <li
        v-for="day in days"
        :key="day.weekday"
        data-testid="availability-day"
        class="flex items-start justify-between gap-4 px-4 py-3"
      >
        <span class="text-subtitle text-fg">{{ day.label }}</span>
        <span class="flex flex-col items-end text-body text-fg-muted">
          <span v-for="range in day.ranges" :key="range.id ?? range.text">{{ range.text }}</span>
        </span>
      </li>
    </ul>
    <UiEmptyState v-else :icon="CalendarClock" title="Sem horários cadastrados" />
  </section>
</template>
