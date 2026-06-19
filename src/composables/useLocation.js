import { ref } from 'vue'

export function useLocation() {
  const cityName = ref('')
  const stateAbbr = ref('')
  const loading = ref(false)
  const error = ref('')

  const stateAbbreviations = {
    Acre: 'AC',
    Alagoas: 'AL',
    Amapá: 'AP',
    Amazonas: 'AM',
    Bahia: 'BA',
    Ceará: 'CE',
    'Distrito Federal': 'DF',
    'Espírito Santo': 'ES',
    Goiás: 'GO',
    Maranhão: 'MA',
    'Mato Grosso': 'MT',
    'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG',
    Pará: 'PA',
    Paraíba: 'PB',
    Paraná: 'PR',
    Pernambuco: 'PE',
    Piauí: 'PI',
    'Rio de Janeiro': 'RJ',
    'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS',
    Rondônia: 'RO',
    Roraima: 'RR',
    'Santa Catarina': 'SC',
    'São Paulo': 'SP',
    Sergipe: 'SE',
    Tocantins: 'TO',
  }

  async function getLocation() {
    if (!navigator.geolocation) {
      error.value = 'Geolocalização não suportada pelo navegador.'
      return
    }

    loading.value = true
    error.value = ''

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${coords.latitude}&lon=${coords.longitude}&format=json`,
        )
        const data = await res.json()
        const { city, town, village, state } = data.address

        cityName.value = city || town || village
        stateAbbr.value = stateAbbreviations[state] || state
        loading.value = false
      },
      () => {
        error.value = `Não foi possível obter a localização`
        loading.value = false
      },
    )
  }

  async function setLocation(lat, lng) {
    loading.value = true
    error.value = ''

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    )

    const data = await res.json()

    const { city, town, village, state } = data.address

    cityName.value = city || town || village
    stateAbbr.value = stateAbbreviations[state] || state
    loading.value = false
  }

  return {
    cityName,
    stateAbbr,
    loading,
    error,
    getLocation,
    setLocation
  }
}
