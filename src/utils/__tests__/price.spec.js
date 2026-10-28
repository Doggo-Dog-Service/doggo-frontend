import { describe, it, expect } from 'vitest'
import { estimatePrice } from '../price'

describe('estimatePrice', () => {
  it('usa preço por hora proporcional', () => {
    expect(estimatePrice({ price_per_hour: '60.00' }, 60)).toBe(60)
    expect(estimatePrice({ price_per_hour: '50' }, 45)).toBe(37.5)
    expect(estimatePrice({ price_per_hour: '10' }, 20)).toBe(3.33)
  })
  it('cai para preço por dia', () => {
    expect(estimatePrice({ price_per_day: '120' }, 60)).toBe(120)
  })
  it('retorna null sem preço', () => {
    expect(estimatePrice({}, 60)).toBeNull()
    expect(estimatePrice({ price_per_hour: null, price_per_day: null }, 60)).toBeNull()
    expect(estimatePrice(null, 60)).toBeNull()
  })
})
