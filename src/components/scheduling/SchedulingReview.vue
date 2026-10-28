<script setup>
import { computed } from 'vue'
import { Info } from 'lucide-vue-next'
import UiCard from '@/components/ui/UiCard.vue'
import UiIcon from '@/components/ui/UiIcon.vue'
import { formatCurrency } from '@/utils/currency'
import { estimatePrice } from '@/utils/price'

const props = defineProps({
  provider: { type: Object, required: true },
  pets: { type: Array, default: () => [] },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  durationMinutes: { type: Number, default: 60 },
})

const pad = (n) => String(n).padStart(2, '0')

const dateLabel = computed(() =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    props.date,
  ),
)

const endTime = computed(() => {
  const [h, m] = props.time.split(':').map(Number)
  const total = (h * 60 + m + props.durationMinutes) % (24 * 60)
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`
})

const petNames = computed(() => props.pets.map((pet) => pet.name).join(', '))

const price = computed(() => estimatePrice(props.provider, props.durationMinutes))
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiCard>
      <dl class="flex flex-col gap-3 text-body">
        <div class="flex justify-between gap-4">
          <dt class="text-fg-muted">Passeador</dt>
          <dd class="text-right font-semibold text-fg">{{ props.provider.full_name }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-fg-muted">{{ props.pets.length > 1 ? 'Pets' : 'Pet' }}</dt>
          <dd class="text-right font-semibold text-fg">{{ petNames }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-fg-muted">Data</dt>
          <dd class="text-right font-semibold text-fg first-letter:uppercase">{{ dateLabel }}</dd>
        </div>
        <div class="flex justify-between gap-4">
          <dt class="text-fg-muted">Horário</dt>
          <dd class="text-right font-semibold text-fg">
            {{ props.time }} – {{ endTime }}
            <span class="font-normal text-fg-muted">({{ props.durationMinutes }} min)</span>
          </dd>
        </div>
        <div class="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt class="text-fg-muted">Preço estimado</dt>
          <dd class="text-title font-bold text-fg">
            {{ price === null ? 'Preço a combinar' : formatCurrency(price) }}
          </dd>
        </div>
      </dl>
    </UiCard>

    <p class="flex items-start gap-2 text-caption text-fg-muted">
      <UiIcon :icon="Info" :size="18" class="mt-0.5 shrink-0" />
      O valor é uma estimativa e o pagamento combinado fora do app diretamente com o passeador.
    </p>
  </div>
</template>
