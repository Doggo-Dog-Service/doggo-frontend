<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { CalendarClock, Plus, Trash2 } from 'lucide-vue-next'
import UiCard from '@/components/ui/UiCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import UiSheet from '@/components/ui/UiSheet.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import AppInput from '@/components/inputs/AppInput.vue'
import notify from '@/utils/notify'
import { useAvailabilityStore } from '@/stores/availability'

const store = useAvailabilityStore()

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

const hhmm = (time) => String(time).slice(0, 5)

const days = computed(() =>
  WEEKDAYS.map((name, weekday) => ({
    weekday,
    name,
    items: store.intervals
      .filter((i) => i.weekday === weekday)
      .sort((a, b) => hhmm(a.start_time).localeCompare(hhmm(b.start_time))),
  })),
)

// Adicionar
const addOpen = ref(false)
const saving = ref(false)
const form = reactive({ weekday: 0, start_time: '08:00', end_time: '12:00' })
const formError = ref('')

function openAdd() {
  formError.value = ''
  addOpen.value = true
}

async function submit() {
  if (!form.start_time || !form.end_time) {
    formError.value = 'Informe o início e o fim.'
    return
  }
  if (form.end_time <= form.start_time) {
    formError.value = 'O fim deve ser depois do início.'
    return
  }
  formError.value = ''
  saving.value = true
  try {
    await store.create({ weekday: Number(form.weekday), start_time: form.start_time, end_time: form.end_time })
    notify.success('Horário adicionado')
    addOpen.value = false
  } catch {
    // a store já notificou a mensagem da API
  } finally {
    saving.value = false
  }
}

// Remover (com confirmação)
const toRemove = ref(null)
const removeOpen = computed({
  get: () => toRemove.value !== null,
  set: (value) => {
    if (!value) toRemove.value = null
  },
})
const removing = ref(false)

async function confirmRemove() {
  removing.value = true
  try {
    await store.remove(toRemove.value.id)
    notify.success('Horário removido')
    toRemove.value = null
  } catch {
    // a store já notificou a mensagem da API
  } finally {
    removing.value = false
  }
}

onMounted(() => store.fetchMine())
</script>

<template>
  <section class="mx-auto flex w-full max-w-2xl flex-col gap-5">
    <div class="flex items-center justify-between gap-3">
      <h1 class="hidden text-display text-fg md:block">Agenda</h1>
      <p class="text-body text-fg-muted md:hidden">Seus horários semanais de atendimento.</p>
      <AppButton
        text="Adicionar horário"
        variant="primary"
        :icon="Plus"
        :block="false"
        class="shrink-0"
        @event="openAdd"
      />
    </div>

    <div v-if="store.intervalsLoading" class="flex flex-col gap-3" role="status" aria-label="Carregando agenda">
      <UiSkeleton v-for="n in 3" :key="n" shape="rect" />
    </div>

    <UiEmptyState
      v-else-if="store.intervalsError"
      :icon="CalendarClock"
      title="Não foi possível carregar a agenda"
      :description="store.intervalsError"
    >
      <template #action>
        <AppButton text="Tentar novamente" variant="secondary" :block="false" @event="store.fetchMine()" />
      </template>
    </UiEmptyState>

    <UiEmptyState
      v-else-if="store.intervals.length === 0"
      :icon="CalendarClock"
      title="Nenhum horário cadastrado"
      description="Adicione os dias e horários em que você atende para receber pedidos."
    />

    <ul v-else class="flex flex-col gap-3">
      <li v-for="day in days" :key="day.weekday">
        <UiCard>
          <h2 class="text-subtitle text-fg">{{ day.name }}</h2>
          <p v-if="day.items.length === 0" class="mt-1 text-body text-fg-muted">Sem horários</p>
          <ul v-else class="mt-2 flex flex-col gap-2">
            <li
              v-for="item in day.items"
              :key="item.id"
              class="flex items-center justify-between gap-3 rounded-control bg-primary-soft py-1 pr-1 pl-3 text-primary"
            >
              <span class="text-body font-semibold">{{ hhmm(item.start_time) }} às {{ hhmm(item.end_time) }}</span>
              <button
                type="button"
                :aria-label="`Remover horário de ${day.name}, ${hhmm(item.start_time)} às ${hhmm(item.end_time)}`"
                class="flex size-11 cursor-pointer items-center justify-center rounded-full text-danger transition-colors hover:bg-danger-soft focus-visible:ring-2 focus-visible:ring-primary"
                @click="toRemove = item"
              >
                <Trash2 :size="20" :stroke-width="2" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </UiCard>
      </li>
    </ul>

    <UiSheet v-model:open="addOpen" title="Adicionar horário">
      <form class="flex flex-col gap-4" novalidate @submit.prevent="submit">
        <div class="flex flex-col gap-2">
          <label for="agenda-weekday" class="text-caption font-semibold text-fg">Dia da semana</label>
          <select
            id="agenda-weekday"
            v-model="form.weekday"
            class="min-h-11 w-full rounded-control border border-line bg-surface px-4 text-body text-fg focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option v-for="(name, index) in WEEKDAYS" :key="index" :value="index">{{ name }}</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <AppInput v-model="form.start_time" label="Início" type="time" required />
          <AppInput v-model="form.end_time" label="Fim" type="time" required />
        </div>
        <p v-if="formError" role="alert" class="text-caption text-danger">{{ formError }}</p>
        <AppButton text="Salvar horário" type="submit" variant="primary" :loading="saving" />
      </form>
    </UiSheet>

    <UiSheet v-model:open="removeOpen" title="Remover horário?">
      <p v-if="toRemove" class="text-body text-fg-muted">
        {{ WEEKDAYS[toRemove.weekday] }}, {{ hhmm(toRemove.start_time) }} às {{ hhmm(toRemove.end_time) }}.
        Tutores não poderão mais agendar nesse intervalo.
      </p>
      <div class="flex flex-col gap-2">
        <AppButton text="Remover" variant="danger" :icon="Trash2" :loading="removing" @event="confirmRemove" />
        <AppButton text="Cancelar" variant="ghost" @event="toRemove = null" />
      </div>
    </UiSheet>
  </section>
</template>
