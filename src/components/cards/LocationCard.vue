<script setup>
import { MapPin } from 'lucide-vue-next'
import UiBadge from '@/components/ui/UiBadge.vue'

const props = defineProps({
  feature: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['select'])

const osmLabels = {
  city: 'Cidade',
  town: 'Cidade',
  village: 'Vila',
  hamlet: 'Aldeia',
  municipality: 'Município',
  street: 'Rua',
  house: 'Número',
  amenity: 'Estabelecimento',
  poi: 'Ponto de Interesse',
  road: 'Estrada',
  suburb: 'Bairro',
  neighbourhood: 'Vizinhança',
  quarter: 'Bairro',
  borough: 'Distrito',
  state: 'Estado',
  country: 'País',
  postcode: 'CEP',
  building: 'Edifício',
  park: 'Parque',
  natural: 'Área Natural',
  water: 'Rio/Lago',
  island: 'Ilha',
  peak: 'Pico',
  valley: 'Vale',
  river: 'Rio',
  lake: 'Lago',
  ocean: 'Oceano',
  railway: 'Ferrovia',
  motorway: 'Rodovia',
  primary: 'Rodovia Principal',
  secondary: 'Rodovia Secundária',
  tertiary: 'Rodovia Terciária',
  restaurant: 'Restaurante',
  hotel: 'Hotel',
  hospital: 'Hospital',
  school: 'Escola',
  university: 'Universidade',
  place: 'Local',
  locality: 'Localidade',
  residential: 'Residencial'
}

const { geometry, properties } = props.feature
const [lng, lat] = geometry.coordinates
const name = properties.name || ''
const street = properties.street || ''
const housenumber = properties.housenumber || ''
const city = properties.city || properties.town || properties.village || ''
const state = properties.state || ''
const country = properties.country || ''
const osmValue = properties.osm_value || ''
const osmLabel = osmLabels[osmValue] || osmValue
const addressParts = [street, housenumber].filter(Boolean)
const addressLine = addressParts.length > 0 ? addressParts.join(', ') : ''
const locationLine = [city, state, country].filter(Boolean).join(', ')

function handleClick() {
  emit('select', { lng, lat, name })
}
</script>

<template>
  <button
    type="button"
    class="flex w-full cursor-pointer items-start gap-3 border-b border-line bg-surface p-3 text-left transition-colors duration-200 last:border-b-0 hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset md:p-4"
    @click="handleClick"
  >
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-soft text-primary"
    >
      <MapPin :size="20" :stroke-width="2" aria-hidden="true" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate text-body font-semibold text-fg">
        {{ name }}
      </p>
      <p v-if="addressLine" class="truncate text-caption text-fg-muted">
        {{ addressLine }}
      </p>
      <p v-if="locationLine" class="truncate text-caption text-fg-muted">
        {{ locationLine }}
      </p>
    </div>
    <UiBadge v-if="osmLabel" tone="brand" class="mt-0.5 shrink-0 self-start">{{ osmLabel }}</UiBadge>
  </button>
</template>
