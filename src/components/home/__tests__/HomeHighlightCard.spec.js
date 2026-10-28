import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeHighlightCard from '@/components/home/HomeHighlightCard.vue'

const RouterLinkStub = {
  props: ['to'],
  template: '<a :data-to="JSON.stringify(to)"><slot /></a>',
}

const mountCard = (props) =>
  mount(HomeHighlightCard, { props, global: { stubs: { RouterLink: RouterLinkStub } } })

const base = {
  id: 9,
  provider_name: 'Ana Souza',
  provider_picture: '',
  pets: [{ name: 'Rex' }, { name: 'Luna' }],
}

afterEach(() => vi.useRealTimers())

describe('HomeHighlightCard', () => {
  it('live: acompanhar ao vivo para service-view com id, pets e tempo decorrido', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T10:25:00'))
    const w = mountCard({
      kind: 'live',
      service: { ...base, status: 3, started_at: '2026-10-28T10:00:00' },
    })
    expect(w.text()).toContain('Acompanhar ao vivo')
    expect(w.text()).toContain('Rex e Luna')
    expect(w.text()).toContain('25 min')
    expect(w.find('a').attributes('data-to')).toBe(
      JSON.stringify({ name: 'service-view', params: { id: 9 } }),
    )
  })

  it('live: tempo decorrido atualiza a cada minuto', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T10:25:00'))
    const w = mountCard({
      kind: 'live',
      service: { ...base, status: 3, started_at: '2026-10-28T10:00:00' },
    })
    vi.advanceTimersByTime(60000)
    await w.vm.$nextTick()
    expect(w.text()).toContain('26 min')
  })

  it('next: ver detalhes para service-view', () => {
    const w = mountCard({
      kind: 'next',
      service: { ...base, status: 2, start_datetime: '2026-10-29T15:30:00' },
    })
    expect(w.text()).toContain('Ver detalhes')
    expect(w.text()).toContain('Ana Souza')
    expect(w.text()).toContain('15:30')
    expect(w.find('a').attributes('data-to')).toBe(
      JSON.stringify({ name: 'service-view', params: { id: 9 } }),
    )
  })

  it('pending: aguardando confirmacao e link ver passeios', () => {
    const w = mountCard({ kind: 'pending', service: { ...base, status: 1 } })
    expect(w.text()).toContain('Aguardando confirmação de Ana Souza')
    expect(w.text()).toContain('Ver passeios')
    expect(w.find('a').attributes('data-to')).toBe(JSON.stringify({ name: 'services-view' }))
  })

  it('empty: agendar passeio para provider-list-view', () => {
    const w = mountCard({ kind: 'empty', service: null })
    expect(w.text()).toContain('Agendar passeio')
    expect(w.find('a').attributes('data-to')).toBe(JSON.stringify({ name: 'provider-list-view' }))
  })
})
