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

    const marker = new maplibregl.Marker(options)
      .setLngLat([lng, lat])
      .addTo(map.value)

    markers.value.push(marker)

    return marker
  }

  function clearMarkers() {
    markers.value.forEach((marker) => marker.remove())

    markers.value = []
  }

  function fitBounds(coordinates, options = {}) {
    if (!map.value || !coordinates?.length) return

    const bounds = coordinates.reduce(
      (acc, coordinate) => acc.extend(coordinate),
      new maplibregl.LngLatBounds(coordinates[0], coordinates[0]),
    )

    map.value.fitBounds(bounds, {
      padding: 60,
      maxZoom: 16,
      ...options,
    })
  }

  function drawRoute(points, options = {}) {
    if (!map.value || !points?.length) return

    const coordinates = points.map((point) => [
      Number(point.longitude),
      Number(point.latitude),
    ])

    const { color = '#2E7D6B', width = 4 } = options

    if (map.value.getLayer('service-route')) {
      map.value.removeLayer('service-route')
    }

    if (map.value.getSource('service-route')) {
      map.value.removeSource('service-route')
    }

    map.value.addSource('service-route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates,
        },
      },
    })

    map.value.addLayer({
      id: 'service-route',
      type: 'line',
      source: 'service-route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': color,
        'line-width': width,
      },
    })

    fitBounds(coordinates)
  }

  function clearRoute() {
    if (!map.value) return

    if (map.value.getLayer('service-route')) {
      map.value.removeLayer('service-route')
    }

    if (map.value.getSource('service-route')) {
      map.value.removeSource('service-route')
    }
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
    fitBounds,
    drawRoute,
    clearRoute,
    createPopUp
  }
}
