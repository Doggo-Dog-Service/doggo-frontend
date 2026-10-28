<script setup>
import { computed, ref } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps({
  maxMonthsAhead: {
    type: Number,
    default: 1,
    validator: (value) => value >= 0,
  },
})

const selectedDate = defineModel({ type: Date, default: null })

const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function startOfDay(date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(month, amount) {
  return new Date(month.getFullYear(), month.getMonth() + amount, 1)
}

function isSameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

const viewMonth = ref(startOfMonth(new Date()))

const displayYear = computed(() => viewMonth.value.getFullYear())

const displayMonth = computed(() => viewMonth.value.getMonth())

const monthName = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(viewMonth.value),
)

const daysInMonth = computed(() => new Date(displayYear.value, displayMonth.value + 1, 0).getDate())

const calendarDays = computed(() => {
  const firstDayOfWeek = new Date(displayYear.value, displayMonth.value, 1).getDay()
  const days = Array.from({ length: firstDayOfWeek }, () => null)

  for (let day = 1; day <= daysInMonth.value; day++) {
    days.push(day)
  }

  return days
})

const canGoToPrevMonth = computed(() => !isSameMonth(viewMonth.value, startOfMonth(new Date())))

const canGoToNextMonth = computed(
  () => !isSameMonth(viewMonth.value, addMonths(startOfMonth(new Date()), props.maxMonthsAhead)),
)

function dateOfDay(day) {
  return startOfDay(new Date(displayYear.value, displayMonth.value, day))
}

function isPast(day) {
  return dateOfDay(day) < startOfDay(new Date())
}

function isToday(day) {
  return isSameMonth(viewMonth.value, new Date()) && day === new Date().getDate()
}

function isSelected(day) {
  return (
    !!selectedDate.value &&
    isSameMonth(viewMonth.value, selectedDate.value) &&
    day === selectedDate.value.getDate()
  )
}

function goToPrevMonth() {
  if (!canGoToPrevMonth.value) return

  viewMonth.value = addMonths(viewMonth.value, -1)
}

function goToNextMonth() {
  if (!canGoToNextMonth.value) return

  viewMonth.value = addMonths(viewMonth.value, 1)
}

function selectDay(day) {
  if (isPast(day)) return

  selectedDate.value = dateOfDay(day)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <button
        type="button"
        :class="[
          'flex size-11 items-center justify-center rounded-full border border-line transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary',
          canGoToPrevMonth
            ? 'cursor-pointer text-primary hover:bg-surface-muted active:scale-95'
            : 'cursor-not-allowed text-fg-subtle',
        ]"
        :disabled="!canGoToPrevMonth"
        aria-label="Mês anterior"
        @click="goToPrevMonth"
      >
        <ChevronLeft :size="20" :stroke-width="2" aria-hidden="true" />
      </button>
      <h3 class="text-subtitle text-fg capitalize">
        {{ monthName }} {{ displayYear }}
      </h3>
      <button
        type="button"
        :class="[
          'flex size-11 items-center justify-center rounded-full border border-line transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary',
          canGoToNextMonth
            ? 'cursor-pointer text-primary hover:bg-surface-muted active:scale-95'
            : 'cursor-not-allowed text-fg-subtle',
        ]"
        :disabled="!canGoToNextMonth"
        aria-label="Próximo mês"
        @click="goToNextMonth"
      >
        <ChevronRight :size="20" :stroke-width="2" aria-hidden="true" />
      </button>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="header in dayHeaders"
        :key="header"
        class="py-1 text-center text-caption font-semibold text-fg-muted"
      >
        {{ header }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div v-for="(day, index) in calendarDays" :key="index" class="flex justify-center">
        <button
          v-if="day"
          type="button"
          :class="[
            'size-10 cursor-pointer rounded-full text-body transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary',
            isSelected(day) && 'bg-primary font-bold text-primary-fg',
            !isSelected(day) && isToday(day) && 'bg-primary-soft font-semibold text-primary',
            !isSelected(day) && !isToday(day) && !isPast(day) && 'text-fg hover:bg-surface-muted',
            isPast(day) && 'cursor-not-allowed text-fg-subtle',
          ]"
          :disabled="isPast(day)"
          :aria-pressed="isSelected(day)"
          @click="selectDay(day)"
        >
          {{ day }}
        </button>
        <div v-else class="size-10"></div>
      </div>
    </div>
  </div>
</template>
