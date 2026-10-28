import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LiveWalkSheet from '../LiveWalkSheet.vue'

const mountSheet = (props = {}) =>
  mount(LiveWalkSheet, {
    props,
    slots: { summary: '<p>resumo</p>', default: '<p>conteudo</p>' },
  })

describe('LiveWalkSheet', () => {
  it('starts collapsed with aria-expanded=false', () => {
    const w = mountSheet()
    const toggle = w.get('[data-sheet-toggle]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(w.get('[data-live-sheet]').attributes('data-level')).toBe('0')
    expect(w.text()).toContain('resumo')
  })

  it('toggle expands to half and back, updating aria-expanded and level', async () => {
    const w = mountSheet()
    const toggle = w.get('[data-sheet-toggle]')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(w.get('[data-live-sheet]').attributes('data-level')).toBe('1')
    await toggle.trigger('click')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(w.get('[data-live-sheet]').attributes('data-level')).toBe('0')
  })

  it('arrow keys step through the three heights', async () => {
    const w = mountSheet()
    const toggle = w.get('[data-sheet-toggle]')
    await toggle.trigger('keydown', { key: 'ArrowUp' })
    await toggle.trigger('keydown', { key: 'ArrowUp' })
    expect(w.get('[data-live-sheet]').attributes('data-level')).toBe('2')
    await toggle.trigger('keydown', { key: 'ArrowUp' })
    expect(w.get('[data-live-sheet]').attributes('data-level')).toBe('2')
    await toggle.trigger('keydown', { key: 'ArrowDown' })
    expect(w.get('[data-live-sheet]').attributes('data-level')).toBe('1')
  })

  it('body is inert while collapsed', async () => {
    const w = mountSheet()
    expect(w.get('[data-sheet-body]').attributes('inert')).toBeDefined()
    await w.get('[data-sheet-toggle]').trigger('click')
    expect(w.get('[data-sheet-body]').attributes('inert')).toBeUndefined()
  })
})
