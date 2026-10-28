import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UiSteps from '../UiSteps.vue'

describe('UiSteps', () => {
  it('mostra "Etapa N de M" e expoe progressbar acessivel', () => {
    const wrapper = mount(UiSteps, { props: { current: 2, total: 4 } })
    expect(wrapper.text()).toContain('Etapa 2 de 4')
    const bar = wrapper.get('[role="progressbar"]')
    expect(bar.attributes('aria-valuenow')).toBe('2')
    expect(bar.attributes('aria-valuemin')).toBe('1')
    expect(bar.attributes('aria-valuemax')).toBe('4')
    expect(bar.get('div').attributes('style')).toContain('50%')
  })

  it('aceita rotulo customizado', () => {
    const wrapper = mount(UiSteps, { props: { current: 1, total: 3, label: 'Passo' } })
    expect(wrapper.text()).toContain('Passo 1 de 3')
  })
})
