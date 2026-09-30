<script setup>
import { computed, ref } from 'vue'

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
          'text-lg border border-doggo-gray rounded-xl px-1.5 py-0.5 transition-all duration-200',
          canGoToPrevMonth
            ? 'text-doggo-green cursor-pointer hover:bg-doggo-green/5 active:scale-95'
            : 'text-gray-300 cursor-not-allowed',
        ]"
        :disabled="!canGoToPrevMonth"
        aria-label="Mês anterior"
        @click="goToPrevMonth"
      >
        <span class="mdi mdi-chevron-left"></span>
      </button>
      <h3 class="text-base font-bold text-doggo-green capitalize">
        {{ monthName }} {{ displayYear }}
      </h3>
      <button
        type="button"
        :class="[
          'text-lg border border-doggo-gray rounded-xl px-1.5 py-0.5 transition-all duration-200',
          canGoToNextMonth
            ? 'text-doggo-green cursor-pointer hover:bg-doggo-green/5 active:scale-95'
            : 'text-gray-300 cursor-not-allowed',
        ]"
        :disabled="!canGoToNextMonth"
        aria-label="Próximo mês"
        @click="goToNextMonth"
      >
        <span class="mdi mdi-chevron-right"></span>
      </button>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="header in dayHeaders"
        :key="header"
        class="text-center text-xs text-gray-400 font-semibold py-1"
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
            'h-9 w-9 rounded-full text-sm transition-all duration-200 cursor-pointer',
            isSelected(day) && 'bg-doggo-green text-white font-bold scale-105',
            !isSelected(day) &&
              isToday(day) &&
              'bg-doggo-light-green/50 text-doggo-green font-semibold',
            !isSelected(day) &&
              !isToday(day) &&
              !isPast(day) &&
              'text-doggo-black hover:bg-doggo-green/10',
            isPast(day) && 'text-gray-300 cursor-not-allowed',
          ]"
          :disabled="isPast(day)"
          @click="selectDay(day)"
        >
          {{ day }}
        </button>
        <div v-else class="h-9 w-9"></div>
      </div>
    </div>
  </div>
</template>
