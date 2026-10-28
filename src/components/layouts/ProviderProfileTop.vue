<script setup>
import { computed, onMounted } from 'vue'
import { BriefcaseBusiness, MapPin, Pencil, Star, Wallet } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import { useLocation } from '@/composables/useLocation'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency } from '@/utils/currency'

const authStore = useAuthStore()

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
})

const { cityName, setLocation } = useLocation()

const isOwnProfile = computed(
  () => authStore.user?.provider_profile?.id === props.provider.id,
)
const count = computed(() => props.provider.rating_count ?? 0)
const ratingText = computed(() =>
  count.value === 0
    ? null
    : props.provider.classification == null
      ? '—'
      : Number(props.provider.classification).toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        }),
)
const countText = computed(() =>
  count.value === 1 ? '1 avaliação' : `${count.value} avaliações`,
)

onMounted(async () => {
  await setLocation(Number(props.provider.fixed_latitude), Number(props.provider.fixed_longitude))
})
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <UiAvatar :src="props.provider.profile_picture" :name="props.provider.full_name" size="lg" />
      <div class="min-w-0">
        <h1 class="text-title text-fg wrap-break-word">{{ props.provider.full_name }}</h1>
        <p class="mt-1 flex items-center gap-1.5 text-body text-fg">
          <Star
            :size="16"
            :stroke-width="2"
            fill="currentColor"
            class="shrink-0 text-warning"
            aria-hidden="true"
          />
          <span v-if="ratingText" class="font-semibold">{{ ratingText }}</span>
          <span class="text-fg-muted">
            {{ count > 0 ? `(${countText})` : 'Sem avaliações ainda' }}
          </span>
        </p>
      </div>
    </div>
    <ul class="flex flex-col gap-2 text-body text-fg-muted">
      <li class="flex items-center gap-2">
        <BriefcaseBusiness :size="16" :stroke-width="2" class="shrink-0 text-primary" aria-hidden="true" />
        {{ props.provider.service_type_name }}
      </li>
      <li v-if="cityName" class="flex items-center gap-2">
        <MapPin :size="16" :stroke-width="2" class="shrink-0 text-primary" aria-hidden="true" />
        {{ cityName }}
      </li>
      <li class="flex items-center gap-2">
        <Wallet :size="16" :stroke-width="2" class="shrink-0 text-primary" aria-hidden="true" />
        <span>
          <span class="font-semibold text-fg">{{ formatCurrency(props.provider.price_per_hour) }}</span>
          por hora
        </span>
      </li>
    </ul>
    <RouterLink
      v-if="isOwnProfile"
      :to="{ name: 'profile-view' }"
      class="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 font-semibold text-fg hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
    >
      <Pencil :size="16" :stroke-width="2" aria-hidden="true" />
      Editar perfil
    </RouterLink>
  </section>
</template>
