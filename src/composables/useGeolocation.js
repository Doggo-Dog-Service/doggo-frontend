import { ref, onUnmounted } from 'vue'

export const useGeolocation = () => {
  const latitude = ref(null)
  const longitude = ref(null)
  const accuracy = ref(null)

  const loading = ref(false)
  const error = ref('')

  const permission = ref(null)

  let watchId = null

  function getCurrentPosition() {
    loading.value = true
    error.value = null

    if (!navigator.geolocation) {
      error.value = 'Geolocalização indisponível'
      loading.value = false
      return
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude.value = position.coords.latitude.toFixed(6)
          longitude.value = position.coords.longitude.toFixed(6)
          accuracy.value = position.coords.accuracy

          loading.value = false

          resolve(position)
        },
        (err) => {
          error.value = err.message
          loading.value = false

          reject(err)
        },
        {
          enableHighAccuracy: true,
        },
      )
    })
  }

  function watchPosition(maximumAge = 0) {
    if (!navigator.geolocation) return

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        latitude.value = position.coords.latitude.toFixed(6)
        longitude.value = position.coords.longitude.toFixed(6)
        accuracy.value = position.coords.accuracy
      },
      (err) => {
        error.value = err.message
      },
      {
        enableHighAccuracy: true,
        maximumAge: maximumAge * 1000,
      },
    )
  }

  function stopWatching() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  async function checkPermission () {
    if(!navigator.permissions) return 

    const result = await navigator.permissions.query({
        name: 'geolocation'
    })

    permission.value = result.state
  }


  onUnmounted(() => {
    stopWatching()
  })

  return {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    permission,
    getCurrentPosition,
    watchPosition,
    stopWatching,
    checkPermission
  }
}
