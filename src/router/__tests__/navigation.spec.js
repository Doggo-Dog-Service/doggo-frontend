import { describe, it, expect } from 'vitest'
import { activeTabName } from '../navigation'

describe('activeTabName', () => {
  it('prestador: services-view ativa a aba Hoje', () => {
    expect(activeTabName({ name: 'services-view', meta: {} }, 'provider')).toBe('provider-today-view')
  })
  it('tutor: services-view ativa Passeios', () => {
    expect(activeTabName({ name: 'services-view', meta: {} }, 'client')).toBe('services-view')
  })
})
