<script setup>
import { BriefcaseBusiness, MapPin } from 'lucide-vue-next'
import UiAvatar from '@/components/ui/UiAvatar.vue'
import { useLocation } from '@/composables/useLocation'
import { useAuthStore } from '@/stores/auth'
import { onMounted } from 'vue'
const authStore = useAuthStore()

const props = defineProps({
  provider: {
    type: Object,
    required: true,
  },
})

const { cityName, setLocation } = useLocation()

onMounted(async () => {
  await setLocation(Number(props.provider.fixed_latitude), Number(props.provider.fixed_longitude))
})
</script>
<template>
  <div class="flex flex-col justify-between gap-4 sm:flex-row">
    <div class="flex gap-4">
      <UiAvatar :src="props.provider.profile_picture" :name="props.provider.full_name" size="lg" />
      <div class="min-w-0">
        <h1 class="text-title text-fg wrap-break-word">
          {{ props.provider.full_name }}
        </h1>
        <div class="flex items-start gap-1 text-body text-fg-muted">
          <MapPin :size="16" :stroke-width="2" class="mt-1 shrink-0 text-primary" aria-hidden="true" />
          <p class="truncate">
            {{ cityName }}
          </p>
        </div>
        <div class="flex items-start gap-1 text-body text-fg-muted">
          <BriefcaseBusiness :size="16" :stroke-width="2" class="mt-1 shrink-0 text-primary" aria-hidden="true" />
          <p class="truncate">
            {{ props.provider.service_type_name }}
          </p>
        </div>
      </div>
    </div>
    <button
      v-if="authStore.user?.provider_profile?.id === props.provider.id"
      class="min-h-11 self-start whitespace-nowrap rounded-full bg-primary-soft px-4 py-2 font-semibold text-primary sm:self-center"
    >
      Editar
    </button>
  </div>
</template>
