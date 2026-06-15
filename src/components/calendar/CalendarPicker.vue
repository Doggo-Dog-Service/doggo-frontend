<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Date,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const today = new Date()
today.setHours(0, 0, 0, 0)

const currentYear = today.getFullYear()
const currentMonth = today.getMonth()

const currentMonthOffset = ref(0)

const displayYear = computed(() => {
  const date = new Date(currentYear, currentMonth + currentMonthOffset.value, 1)
  return date.getFullYear()
})

const displayMonth = computed(() => {
  const date = new Date(currentYear, currentMonth + currentMonthOffset.value, 1)
  return date.getMonth()
})

const monthName = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(displayYear.value, displayMonth.value)
  )
)

const daysInMonth = computed(() =>
  new Date(displayYear.value, displayMonth.value + 1, 0).getDate()
)

const firstDayOfWeek = computed(() =>
  new Date(displayYear.value, displayMonth.value, 1).getDay()
)

const dayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const calendarDays = computed(() => {
  const days = []
  for (let i = 0; i < firstDayOfWeek.value; i++) {
    days.push(null)
  }
  for (let d = 1; d <= daysInMonth.value; d++) {
    days.push(d)
  }
  return days
})

function goToPrevMonth() {
  if (currentMonthOffset.value > 0) currentMonthOffset.value--
}

function goToNextMonth() {
  if (currentMonthOffset.value < 1) currentMonthOffset.value++
}

function isPast(day) {
  const date = new Date(displayYear.value, displayMonth.value, day)
  date.setHours(0, 0, 0, 0)
  return date < today
}

function isToday(day) {
  return (
    day === today.getDate() &&
    displayMonth.value === today.getMonth() &&
    displayYear.value === today.getFullYear()
  )
}

function isSelected(day) {
  if (!props.modelValue) return false
  return (
    day === props.modelValue.getDate() &&
    displayMonth.value === props.modelValue.getMonth() &&
    displayYear.value === props.modelValue.getFullYear()
  )
}

function selectDay(day) {
  if (isPast(day)) return
  const selected = new Date(displayYear.value, displayMonth.value, day)
  selected.setHours(0, 0, 0, 0)
  emit('update:modelValue', selected)
  console.log(selected)
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <button
        :class="[
          'text-lg border border-doggo-gray rounded-xl px-1.5 py-0.5 transition-all duration-200',
          currentMonthOffset > 0
            ? 'text-doggo-green cursor-pointer hover:bg-doggo-green/5 active:scale-95'
            : 'text-gray-300 cursor-not-allowed',
        ]"
        :disabled="currentMonthOffset === 0"
        @click="goToPrevMonth"
      >
        <span class="mdi mdi-chevron-left"></span>
      </button>
      <h3 class="text-base font-bold text-doggo-green capitalize">{{ monthName }} {{ displayYear }}</h3>
      <button
        :class="[
          'text-lg border border-doggo-gray rounded-xl px-1.5 py-0.5 transition-all duration-200',
          currentMonthOffset < 1
            ? 'text-doggo-green cursor-pointer hover:bg-doggo-green/5 active:scale-95'
            : 'text-gray-300 cursor-not-allowed',
        ]"
        :disabled="currentMonthOffset === 1"
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
          :class="[
            'h-9 w-9 rounded-full text-sm transition-all duration-200 cursor-pointer',
            isSelected(day) && 'bg-doggo-green text-white font-bold scale-105',
            !isSelected(day) && isToday(day) && 'bg-doggo-light-green/50 text-doggo-green font-semibold',
            !isSelected(day) && !isToday(day) && !isPast(day) && 'text-doggo-black hover:bg-doggo-green/10',
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
