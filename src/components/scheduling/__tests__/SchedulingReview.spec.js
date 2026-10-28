import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SchedulingReview from '@/components/scheduling/SchedulingReview.vue'

const base = {
  provider: { full_name: 'Carlos', service_type_name: 'Passeio', price_per_hour: '40.00' },
  pets: [
    { id: 1, name: 'Rex' },
    { id: 2, name: 'Mel' },
  ],
  date: new Date(2026, 10, 5),
  time: '09:30',
  durationMinutes: 45,
}

const mountReview = (props = {}) => mount(SchedulingReview, { props: { ...base, ...props } })

describe('SchedulingReview', () => {
  it('mostra pets, início-fim e preço estimado', () => {
    const text = mountReview().text()
    expect(text).toContain('Carlos')
    expect(text).toContain('Rex')
    expect(text).toContain('Mel')
    expect(text).toContain('09:30')
    expect(text).toContain('10:15')
    expect(text).toContain('30,00')
  })

  it('mostra "Preço a combinar" sem preço', () => {
    const text = mountReview({ provider: { full_name: 'Carlos' } }).text()
    expect(text).toContain('Preço a combinar')
  })

  it('avisa que o pagamento é fora do app', () => {
    expect(mountReview().text()).toContain('o pagamento é combinado fora do app')
  })
})
