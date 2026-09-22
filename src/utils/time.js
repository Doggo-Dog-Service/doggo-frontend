const pad = (value) => String(value).padStart(2, '0')

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