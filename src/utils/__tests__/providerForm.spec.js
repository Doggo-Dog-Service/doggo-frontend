import { describe, expect, it } from 'vitest'
import { buildProviderPayload, mapProviderErrors, validateProviderForm } from '../providerForm'

const valid = () => ({
  latitude: -23.5,
  longitude: '-46.633',
  service_type: 1,
  price_per_hour: '25',
  price_per_day: '',
  description: '  ola  ',
})

describe('validateProviderForm', () => {
  it('aceita formulario valido', () => {
    expect(validateProviderForm(valid())).toEqual({})
  })

  it('exige local, tipo e preco', () => {
    const errors = validateProviderForm({ latitude: null, longitude: null, service_type: null, price_per_hour: '', price_per_day: '', description: '' })
    expect(Object.keys(errors).sort()).toEqual(['location', 'price', 'service_type'])
  })

  it('rejeita preco zero', () => {
    expect(validateProviderForm({ ...valid(), price_per_day: '0' }).price).toBe('O preço precisa ser maior que zero.')
  })
})

describe('buildProviderPayload', () => {
  it('monta coordenadas com 6 casas e omite precos vazios', () => {
    expect(buildProviderPayload(valid())).toEqual({
      fixed_latitude: '-23.500000',
      fixed_longitude: '-46.633000',
      service_type: 1,
      price_per_hour: '25',
      description: 'ola',
    })
  })
})

describe('mapProviderErrors', () => {
  it('traduz campos do backend para campos do formulario', () => {
    const errors = mapProviderErrors({ fixed_latitude: ['x'], service_type: ['y'], price_per_day: ['z'], description: ['w'] })
    expect(Object.keys(errors).sort()).toEqual(['description', 'location', 'price', 'service_type'])
  })
})
