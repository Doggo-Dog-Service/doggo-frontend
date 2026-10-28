import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ServiceStatusBadge from '../ServiceStatusBadge.vue'
import { STATUS_META } from '@/utils/serviceStatus'

describe('ServiceStatusBadge', () => {
  it('status 4 is Concluído success', () => {
    const w = mount(ServiceStatusBadge, { props: { status: 4 } })
    expect(w.text()).toContain('Concluído')
    expect(w.classes()).toContain('bg-success-soft')
  })
  it('STATUS_META tones', () => {
    expect(Object.values(STATUS_META).map((m) => m.tone)).toEqual([
      'warning',
      'info',
      'brand',
      'success',
      'neutral',
      'danger',
    ])
  })
  it('unknown status falls back', () => {
    expect(mount(ServiceStatusBadge, { props: { status: 99 } }).text()).toContain('Desconhecido')
  })
})
