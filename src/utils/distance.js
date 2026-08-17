export const haversine = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null

  const toRad = (value) => (Number(value) * Math.PI) / 180
  const earthRadius = 6371

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadius * c
}

export const formatDistance = (distance) => {
  if (distance == null || Number.isNaN(Number(distance))) return null

  const value = Number(distance)

  if (value < 10) {
    return `${value.toFixed(1).replace('.', ',')} km`
  }

  return `${Math.round(value)} km`
}
