import { describe, it, expect } from 'vitest'
import { signalState, minutesSince } from '../signal'

const now = new Date('2026-10-28T12:00:00Z')
const ago = (s) => new Date(now.getTime() - s * 1000)

describe('signalState', () => {
  it('none sem posição', () => expect(signalState(null, now)).toBe('none'))
  it('live com 10 s', () => expect(signalState(ago(10), now)).toBe('live'))
  it('stale com 45 s', () => expect(signalState(ago(45), now)).toBe('stale'))
  it('lost com 61 s', () => expect(signalState(ago(61), now)).toBe('lost'))
  it('aceita string ISO', () => expect(signalState(ago(5).toISOString(), now)).toBe('live'))
})

describe('minutesSince', () => {
  it('125 s -> 2', () => expect(minutesSince(ago(125), now)).toBe(2))
  it('nunca negativo', () => expect(minutesSince(ago(-30), now)).toBe(0))
})
