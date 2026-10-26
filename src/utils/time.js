const pad = (value) => String(value).padStart(2, '0')

export const SLOT_PERIODS = [
  { label: 'Manhã', from: 0, to: 12 },
  { label: 'Tarde', from: 12, to: 18 },
  { label: 'Noite', from: 18, to: 24 },
]

export const formatElapsed = (seconds) => {
  if (seconds == null || Number.isNaN(Number(seconds))) return '00:00:00'

  const total = Math.max(0, Math.floor(Number(seconds)))

  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remaining = total % 60

  return `${pad(hours)}:${pad(minutes)}:${pad(remaining)}`
}

export const formatDateTime = (iso) => {
  if (!iso) return ''

  const date = new Date(iso)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Agrupa os horários (HH:MM) em períodos do dia apenas para exibição.
 * A ordem dos slots é preservada e períodos sem horários são descartados.
 */
export const groupSlotsByPeriod = (slots = []) => {
  if (!Array.isArray(slots)) return []

  return SLOT_PERIODS.map((period) => ({
    label: period.label,
    slots: slots.filter((slot) => {
      const hour = Number.parseInt(String(slot).slice(0, 2), 10)

      if (Number.isNaN(hour)) return false

      return hour >= period.from && hour < period.to
    }),
  })).filter((period) => period.slots.length > 0)
}
