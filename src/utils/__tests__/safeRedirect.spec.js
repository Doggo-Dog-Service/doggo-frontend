import { describe, it, expect } from 'vitest'
import { safeRedirect } from '../safeRedirect'

describe('safeRedirect', () => {
  it('aceita caminho interno', () => {
    expect(safeRedirect('/services/')).toBe('/services/')
    expect(safeRedirect('/services/?a=1')).toBe('/services/?a=1')
  })

  it.each(['//evil.com', 'https://evil.com', '/\\evil', '', undefined, null, 42, ['/a']])(
    'rejeita %s',
    (value) => {
      expect(safeRedirect(value)).toBeNull()
    },
  )
})
