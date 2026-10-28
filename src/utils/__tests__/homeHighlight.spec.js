import { describe, it, expect } from 'vitest'
import { pickHomeHighlight } from '../homeHighlight'

const now = new Date('2026-10-28T12:00:00Z')
const s = (id, status, extra = {}) => ({ id, status, ...extra })

describe('pickHomeHighlight', () => {
  it('lista vazia', () => {
    expect(pickHomeHighlight([], now)).toEqual({ kind: 'empty', service: null })
    expect(pickHomeHighlight(undefined, now)).toEqual({ kind: 'empty', service: null })
  })
  it('live vence next e pending', () => {
    const live = s(1, 3, { started_at: '2026-10-28T11:30:00Z' })
    const r = pickHomeHighlight(
      [s(2, 2, { start_datetime: '2026-10-29T10:00:00Z' }), s(3, 1, { created_at: '2026-10-27T10:00:00Z' }), live],
      now,
    )
    expect(r).toEqual({ kind: 'live', service: live })
  })
  it('next ignora confirmado no passado', () => {
    const r = pickHomeHighlight([s(1, 2, { start_datetime: '2026-10-28T08:00:00Z' })], now)
    expect(r.kind).toBe('empty')
  })
  it('next escolhe o mais próximo', () => {
    const r = pickHomeHighlight(
      [
        s(1, 2, { start_datetime: '2026-10-30T10:00:00Z' }),
        s(2, 2, { start_datetime: '2026-10-29T10:00:00Z' }),
        s(3, 2, { start_datetime: '2026-10-28T08:00:00Z' }),
      ],
      now,
    )
    expect(r.kind).toBe('next')
    expect(r.service.id).toBe(2)
  })
  it('next vence pending', () => {
    const r = pickHomeHighlight(
      [s(1, 1, { created_at: '2026-10-27T10:00:00Z' }), s(2, 2, { start_datetime: '2026-10-29T10:00:00Z' })],
      now,
    )
    expect(r.kind).toBe('next')
  })
  it('pending escolhe o mais recente por created_at', () => {
    const r = pickHomeHighlight(
      [s(1, 1, { created_at: '2026-10-25T10:00:00Z' }), s(2, 1, { created_at: '2026-10-27T10:00:00Z' })],
      now,
    )
    expect(r.kind).toBe('pending')
    expect(r.service.id).toBe(2)
  })
  it('status 4/5/6 ignorados', () => {
    const r = pickHomeHighlight([s(1, 4), s(2, 5), s(3, 6)], now)
    expect(r).toEqual({ kind: 'empty', service: null })
  })
})
