function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function estimatePrice(provider, durationMinutes) {
  const perHour = toNumber(provider?.price_per_hour)
  if (perHour !== null) {
    return Math.round(((perHour * durationMinutes) / 60) * 100) / 100
  }
  return toNumber(provider?.price_per_day)
}
