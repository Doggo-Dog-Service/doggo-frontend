import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from '../AppButton.vue'
import IconButton from '../IconButton.vue'
import { PawPrint } from 'lucide-vue-next'

describe('AppButton', () => {
  it('mode outline renders primary variant', () => {
    const w = mount(AppButton, { props: { text: 'x', mode: 'outline' } })
    expect(w.attributes('data-variant')).toBe('primary')
  })
  it('mode red renders danger variant', () => {
    const w = mount(AppButton, { props: { text: 'x', mode: 'red' } })
    expect(w.attributes('data-variant')).toBe('danger')
  })
  it('mode default renders secondary variant', () => {
    const w = mount(AppButton, { props: { text: 'x' } })
    expect(w.attributes('data-variant')).toBe('secondary')
  })
  it('explicit variant wins over mode', () => {
    const w = mount(AppButton, { props: { text: 'x', mode: 'red', variant: 'ghost' } })
    expect(w.attributes('data-variant')).toBe('ghost')
  })
  it('loading disables and shows spinner', () => {
    const w = mount(AppButton, { props: { text: 'x', loading: true } })
    expect(w.attributes('disabled')).toBeDefined()
    expect(w.find('svg.lucide-loader-circle, svg.lucide-loader-2').exists()).toBe(true)
    expect(w.find('svg').classes()).toContain('animate-spin')
  })
  it('click emits event', async () => {
    const w = mount(AppButton, { props: { text: 'x' } })
    await w.trigger('click')
    expect(w.emitted('event')).toHaveLength(1)
  })
  it('block is true by default', () => {
    expect(mount(AppButton, { props: { text: 'x' } }).classes()).toContain('w-full')
    expect(mount(AppButton, { props: { text: 'x', block: false } }).classes()).not.toContain('w-full')
  })
})

describe('IconButton', () => {
  it('aria-label equals label', () => {
    const w = mount(IconButton, { props: { icon: PawPrint, label: 'Editar' } })
    expect(w.attributes('aria-label')).toBe('Editar')
  })
  it('tooltip legado serve de rótulo', () => {
    const w = mount(IconButton, { props: { icon: PawPrint, tooltip: 'Deletar pet' } })
    expect(w.attributes('aria-label')).toBe('Deletar pet')
    expect(w.find('svg').exists()).toBe(true)
  })
  it('emits event', async () => {
    const w = mount(IconButton, { props: { icon: PawPrint, label: 'x' } })
    await w.trigger('click')
    expect(w.emitted('event')).toHaveLength(1)
  })
})
