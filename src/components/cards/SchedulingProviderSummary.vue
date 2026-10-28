<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import AppButton from '@/components/buttons/AppButton.vue'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import { formatCurrency } from '@/utils/currency'

defineEmits(['retry'])

const props = defineProps({
  provider: { type: Object, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const priceLabel = computed(() => {
  const p = props.provider
  if (p?.price_per_hour != null && p.price_per_hour !== '') return `${formatCurrency(p.price_per_hour)}/h`
  if (p?.price_per_day != null && p.price_per_day !== '') return `${formatCurrency(p.price_per_day)}/dia`
  return 'Preço a combinar'
})

const rating = computed(() => {
  const value = Number(props.provider?.classification)
  return props.provider?.classification == null || Number.isNaN(value)
    ? ''
    : value.toFixed(1).replace('.', ',')
})
</script>

<template>
  <div
    v-if="provider"
    class="flex items-center gap-3 rounded-card border border-line bg-surface p-3"
  >
    <UiAvatar :src="provider.profile_picture" :name="provider.full_name" size="md" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-body font-semibold text-fg">{{ provider.full_name }}</p>
      <p class="flex items-center gap-1 truncate text-caption text-fg-muted">
        <Star
          v-if="rating"
          :size="14"
          :stroke-width="2"
          fill="currentColor"
          class="shrink-0 text-warning"
          aria-hidden="true"
        />
        <span v-if="rating" class="font-semibold text-fg">{{ rating }}</span>
        <span v-if="provider.service_type_name" class="truncate">{{ provider.service_type_name }}</span>
      </p>
    </div>
    <p class="shrink-0 text-body font-semibold text-primary">{{ priceLabel }}</p>
  </div>

  <section v-else>
    <UiSkeleton v-if="loading" class="h-16 w-full" />

    <div v-else class="flex flex-col items-start gap-3">
      <p role="alert" class="text-caption font-semibold text-danger">
        {{ error || 'Não foi possível carregar os dados deste profissional.' }}
      </p>
      <AppButton text="Tentar novamente" variant="primary" :block="false" @event="$emit('retry')" />
    </div>
  </section>
</template>
