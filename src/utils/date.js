const pad = (value) => String(value).padStart(2, '0')

/**
 * Converte um Date local no formato AAAA-MM-DD usado nas query params da API.
 * Não usar toISOString() aqui: ele converte para UTC e deslocaria a data.
 */
export const toDateParam = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/**
 * Converte um Date local em ISO 8601 preservando o offset local (ex.: -03:00).
 */
export const toLocalIsoString = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''

  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const offset = `${sign}${pad(Math.floor(Math.abs(offsetMinutes) / 60))}:${pad(
    Math.abs(offsetMinutes) % 60,
  )}`

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}${offset}`
}

/**
 * Monta um Date local a partir de uma data (AAAA-MM-DD) e um horário (HH:MM).
 */
export const fromDateAndTime = (date, time) => {
  if (!(date instanceof Date) || !time) return null

  const [hours, minutes] = String(time).split(':')
  const parsedHours = Number.parseInt(hours, 10)
  const parsedMinutes = Number.parseInt(minutes, 10)

  if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes)) return null

  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  result.setHours(parsedHours, parsedMinutes, 0, 0)

  return result
}
