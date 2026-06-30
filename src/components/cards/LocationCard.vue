<script setup>
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
    class="w-full flex items-start gap-3 bg-white p-3 md:p-4 border-b border-doggo-gray last:border-b-0 text-left transition-all duration-200 hover:bg-doggo-green/5 active:scale-[0.99]"
    @click="handleClick"
  >
    <span
      class="flex items-center justify-center shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-lg bg-doggo-light-green text-doggo-green text-lg md:text-xl"
    >
      <span class="mdi mdi-map-marker"></span>
    </span>
    <div class="min-w-0 flex-1">
      <p class="text-sm md:text-base font-semibold text-doggo-black truncate">
        {{ name }}
      </p>
      <p v-if="addressLine" class="text-xs md:text-sm text-zinc-400 truncate">
        {{ addressLine }}
      </p>
      <p v-if="locationLine" class="text-xs md:text-sm text-zinc-400 truncate">
        {{ locationLine }}
      </p>
    </div>
    <span
      v-if="osmLabel"
      class="shrink-0 self-start text-[10px] md:text-xs leading-tight text-doggo-green bg-doggo-light-green/60 rounded-full px-2 py-0.5 mt-0.5"
    >
      {{ osmLabel }}
    </span>
  </button>
</template>
