<script setup>
import { computed, onMounted, ref } from 'vue'
import { Calendar, Clock } from 'lucide-vue-next'
import AppInput from '@/components/inputs/AppInput.vue'
import TextInput from '@/components/inputs/TextInput.vue'
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import ProviderLocationPicker from '@/components/signup/ProviderLocationPicker.vue'
import { useSignupWizard } from '@/composables/useSignupWizard'
import { useServiceTypeStore } from '@/stores/serviceType'

const { provider, errors } = useSignupWizard()
const serviceTypeStore = useServiceTypeStore()
const locationHint = ref('')

const location = computed({
  get: () => ({ latitude: provider.latitude, longitude: provider.longitude }),
  set: ({ latitude, longitude }) => {
    provider.latitude = latitude
    provider.longitude = longitude
  },
})

onMounted(() => {
  if (!serviceTypeStore.typeServices.length) serviceTypeStore.getTypeServices()
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <section class="flex flex-col gap-2" aria-labelledby="provider-location">
      <h2 id="provider-location" class="text-subtitle text-fg">Onde você atende</h2>
      <ProviderLocationPicker v-model="location" @error="locationHint = $event" />
      <p v-if="locationHint" class="text-caption text-fg-muted">{{ locationHint }}</p>
      <p v-if="errors.location" role="alert" class="text-caption text-danger">{{ errors.location }}</p>
    </section>

    <fieldset class="flex flex-col gap-2">
      <legend class="mb-2 text-caption font-semibold text-fg">
        Tipo de serviço <span class="text-danger" aria-hidden="true">*</span>
      </legend>
      <div class="grid grid-cols-2 gap-2">
        <ChoseButton
          v-for="type in serviceTypeStore.typeServices"
          :key="type.id"
          :text="type.name"
          :selected="provider.service_type === type.id"
          @select="provider.service_type = type.id"
        />
      </div>
      <p v-if="errors.service_type" role="alert" class="text-caption text-danger">{{ errors.service_type }}</p>
    </fieldset>

    <section class="flex flex-col gap-2" aria-labelledby="provider-prices">
      <h2 id="provider-prices" class="text-subtitle text-fg">Preços</h2>
      <div class="grid grid-cols-2 gap-4">
        <AppInput v-model="provider.price_per_hour" :icon="Clock" label="Por hora" placeholder="R$ 0,00" type="number" min="0" step="0.01" />
        <AppInput v-model="provider.price_per_day" :icon="Calendar" label="Por dia" placeholder="R$ 0,00" type="number" min="0" step="0.01" />
      </div>
      <p v-if="errors.price" role="alert" class="text-caption text-danger">{{ errors.price }}</p>
    </section>

    <TextInput
      v-model="provider.description"
      :error="errors.description"
      label="Sobre você"
      placeholder="Conte sua experiência com cães (opcional)"
    />

    <div class="flex items-center justify-between gap-3 rounded-card border border-line bg-surface-muted p-4 opacity-70">
      <span class="text-body text-fg">Documentos</span>
      <UiBadge>Em breve</UiBadge>
    </div>
  </div>
</template>
