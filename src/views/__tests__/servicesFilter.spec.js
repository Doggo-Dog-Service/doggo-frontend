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

import { buildServiceParams } from '@/utils/serviceFilters'

describe('buildServiceParams', () => {
  const provider = { provider_profile: { id: 7 }, client_profile: { id: 3 } }
  const clientOnly = { client_profile: { id: 3 } }

  it('pedidos: status 1 do prestador', () => {
    expect(buildServiceParams({ filter: 'pendentes', mode: 'provider', user: provider })).toEqual({ status: 1, provider: 7 })
  })

  it('hoje: prestador com page_size maximo', () => {
    expect(buildServiceParams({ filter: 'ativos', mode: 'provider', user: provider })).toEqual({ provider: 7, page_size: 100 })
  })

  it('tutor: client com page_size maximo', () => {
    expect(buildServiceParams({ filter: 'todos', mode: 'client', user: clientOnly })).toEqual({ client: 3, page_size: 100 })
  })

  it('prestador em services-view escopa por provider', () => {
    expect(buildServiceParams({ filter: 'todos', mode: 'provider', user: provider })).toEqual({ provider: 7, page_size: 100 })
  })

  it('chip de status acrescenta status', () => {
    expect(buildServiceParams({ filter: 'todos', mode: 'client', user: clientOnly, status: 4 })).toEqual({ client: 3, page_size: 100, status: 4 })
  })
})
