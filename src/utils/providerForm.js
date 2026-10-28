import { parseFieldErrors } from '@/utils/errors'

const filled = (value) => String(value ?? '').trim() !== ''

// Valida o formulário do passeador e devolve { campo: mensagem } (vazio = válido).
export function validateProviderForm(form) {
  const { latitude, longitude, service_type, price_per_hour, price_per_day } = form
  const errors = {}
  if (!filled(latitude) || !filled(longitude) || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude))) {
    errors.location = 'Marque no mapa onde você atende.'
  }
  if (!service_type) errors.service_type = 'Escolha o tipo de serviço.'
  if (!filled(price_per_hour) && !filled(price_per_day)) {
    errors.price = 'Informe o preço por hora ou por dia.'
  }
  if ([price_per_hour, price_per_day].some((v) => filled(v) && !(Number(v) > 0))) {
    errors.price = 'O preço precisa ser maior que zero.'
  }
  return errors
}

// Corpo do POST de passeador: coordenadas como string com 6 casas.
export function buildProviderPayload(form) {
  const { latitude, longitude, service_type, price_per_hour, price_per_day, description } = form
  const payload = {
    fixed_latitude: Number(latitude).toFixed(6),
    fixed_longitude: Number(longitude).toFixed(6),
    service_type,
  }
  if (filled(price_per_hour)) payload.price_per_hour = price_per_hour
  if (filled(price_per_day)) payload.price_per_day = price_per_day
  if (description?.trim()) payload.description = description.trim()
  return payload
}

// Erros de campo do backend (response.data) -> campos do formulário.
export function mapProviderErrors(data) {
  const fields = parseFieldErrors(data)
  const errors = {}
  if (fields.fixed_latitude || fields.fixed_longitude) errors.location = fields.fixed_latitude || fields.fixed_longitude
  if (fields.service_type) errors.service_type = fields.service_type
  if (fields.price_per_hour || fields.price_per_day) errors.price = fields.price_per_hour || fields.price_per_day
  if (fields.description) errors.description = fields.description
  return errors
}
