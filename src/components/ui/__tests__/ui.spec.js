import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UiBadge from '../UiBadge.vue'
import UiAvatar from '../UiAvatar.vue'
import UiEmptyState from '../UiEmptyState.vue'
import UiSkeleton from '../UiSkeleton.vue'
import UiCard from '../UiCard.vue'

describe('UiBadge', () => {
  it('class by tone', () => {
    const w = mount(UiBadge, { props: { tone: 'success' }, slots: { default: 'ok' } })
    expect(w.classes()).toContain('bg-success-soft')
    expect(w.classes()).toContain('text-success')
    expect(w.text()).toBe('ok')
  })
  it('neutral default', () => {
    expect(mount(UiBadge).classes()).toContain('bg-surface-muted')
  })
})

describe('UiAvatar', () => {
  it('initials without src', () => {
    expect(mount(UiAvatar, { props: { name: 'Ana Souza' } }).text()).toBe('AS')
  })
  it('image error falls back to initials', async () => {
    const w = mount(UiAvatar, { props: { name: 'Ana Souza', src: 'x.png' } })
    expect(w.find('img').exists()).toBe(true)
    await w.find('img').trigger('error')
    expect(w.find('img').exists()).toBe(false)
    expect(w.text()).toBe('AS')
  })
})

describe('UiEmptyState', () => {
  it('title, description, action', () => {
    const w = mount(UiEmptyState, {
      props: { title: 'Vazio', description: 'Nada aqui' },
      slots: { action: '<button>Criar</button>' },
    })
    expect(w.text()).toContain('Vazio')
    expect(w.text()).toContain('Nada aqui')
    expect(w.find('button').text()).toBe('Criar')
  })
})

describe('UiSkeleton', () => {
  it('lines=3 renders 3 bars', () => {
    const w = mount(UiSkeleton, { props: { lines: 3 } })
    expect(w.findAll('[data-skeleton-line]')).toHaveLength(3)
  })
})

describe('UiCard', () => {
  it('interactive is focusable and emits click', async () => {
    const w = mount(UiCard, { props: { interactive: true }, slots: { default: 'c' } })
    expect(w.attributes('tabindex')).toBe('0')
    await w.trigger('click')
    expect(w.emitted('click')).toHaveLength(1)
  })
  it('static has no tabindex', () => {
    expect(mount(UiCard).attributes('tabindex')).toBeUndefined()
  })
})

