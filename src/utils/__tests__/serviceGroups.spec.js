import { describe, it, expect } from 'vitest'
import { groupServices } from '../serviceGroups'

const now = new Date(2026, 9, 28, 12, 0, 0)
const at = (d, h = 10) => new Date(2026, 9, d, h, 0, 0).toISOString()
const svc = (id, day, status, hour) => ({ id, status, start_datetime: at(day, hour), created_at: at(1) })

describe('groupServices', () => {
  it('classifica nos três grupos', () => {
    const r = groupServices([
      svc(1, 28, 2),
      svc(2, 27, 3),
      svc(3, 30, 2),
      svc(4, 30, 5),
      svc(5, 20, 4),
    ], now)
    expect(r.today.map((s) => s.id).sort()).toEqual([1, 2])
    expect(r.upcoming.map((s) => s.id)).toEqual([3])
    expect(r.past.map((s) => s.id).sort()).toEqual([4, 5])
  })

  it('ordena today/upcoming crescente e past decrescente', () => {
    const r = groupServices([
      svc(1, 28, 2, 18), svc(2, 28, 2, 9),
      svc(3, 31, 1), svc(4, 29, 2),
      svc(5, 10, 4), svc(6, 20, 4),
    ], now)
    expect(r.today.map((s) => s.id)).toEqual([2, 1])
    expect(r.upcoming.map((s) => s.id)).toEqual([4, 3])
    expect(r.past.map((s) => s.id)).toEqual([6, 5])
  })

  it('lista vazia ou ausente', () => {
    expect(groupServices(undefined, now)).toEqual({ today: [], upcoming: [], past: [] })
  })
})
