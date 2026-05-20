import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { onUnmounted, ref } from 'vue'

const styles = {
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
}

export const useMap = () => {
  const map = ref(null)
  const markers = ref([])
  const loaded = ref(false)

  function createMap(container, center = [0, 0], zoom = 12, options) {
    map.value = new maplibregl.Map({
      container,
      style: styles.light,
      center,
      zoom,
      ...options,
    })

    map.value.on('load', () => {
      loaded.value = true
    })

    return map.value
  }

  function setStyle(style) {
    if (!map.value) return

    map.value.setStyle(styles[style])
  }

  function flyTo(lng, lat) {
    if (!map.value) return

    map.value.flyTo({
      center: [lng, lat],
      zoom: 15,
    })
  }

  function addMarker(lng, lat, options) {
    if(!map.value) return

    const marker = maplibregl.Marker(options)
      .setLngLat([lng, lat])
      .addTo(map.value)

    markers.value.push(marker)

    return marker
  }

  function clearMarkers() {
    markers.value.forEach((marker) => marker.remove())

    markers.value = []
  }

  function createPopUp(html) {
    return new maplibregl.Popup().setHTML(html)
  }

  function destroyMap() {
    map.value?.remove()
  }

  onUnmounted(() => {
    destroyMap()
  })

  return {
    map,
    markers,
    loaded,
    styles,
    createMap,
    destroyMap,
    setStyle,
    flyTo,
    addMarker,
    clearMarkers,
    createPopUp
  }
}
