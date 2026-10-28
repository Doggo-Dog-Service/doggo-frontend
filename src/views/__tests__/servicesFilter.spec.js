import { describe, it, expect } from 'vitest'
import { filterServices } from '@/utils/serviceFilters'

const list = [
  { id: 1, status: 1, start_datetime: '2026-10-30T10:00:00' },
  { id: 2, status: 3, start_datetime: '2026-10-29T15:00:00' },
  { id: 3, status: 2, start_datetime: '2026-10-28T09:00:00' },
  { id: 4, status: 4, start_datetime: '2026-10-27T09:00:00' },
]

describe('filterServices', () => {
  it('ativos: status 2 e 3 por start_datetime crescente', () => {
    expect(filterServices(list, 'ativos').map((s) => s.id)).toEqual([3, 2])
  })

  it('ativos nao altera a lista original', () => {
    const copy = [...list]
    filterServices(list, 'ativos')
    expect(list).toEqual(copy)
  })

  it('pendentes: so status 1', () => {
    expect(filterServices(list, 'pendentes').map((s) => s.id)).toEqual([1])
  })

  it('todos devolve a lista inalterada', () => {
    expect(filterServices(list, 'todos')).toEqual(list)
  })

  it('valor invalido ou ausente devolve a lista inalterada', () => {
    expect(filterServices(list, 'xpto')).toEqual(list)
    expect(filterServices(list, undefined)).toEqual(list)
  })
})
