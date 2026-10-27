import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import UiSegmented from '../UiSegmented.vue'
import UiSheet from '../UiSheet.vue'

describe('UiSegmented', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
    { value: 'c', label: 'C' },
  ]
  it('radiogroup, click emits', async () => {
    const w = mount(UiSegmented, { props: { modelValue: 'a', options, label: 'Modo' } })
    expect(w.attributes('role')).toBe('radiogroup')
    await w.findAll('[role=radio]')[1].trigger('click')
    expect(w.emitted('update:modelValue')[0]).toEqual(['b'])
  })
  it('arrow right moves selection', async () => {
    const w = mount(UiSegmented, { props: { modelValue: 'a', options, label: 'Modo' } })
    await w.findAll('[role=radio]')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(w.emitted('update:modelValue')[0]).toEqual(['b'])
  })
  it('arrow left wraps around', async () => {
    const w = mount(UiSegmented, { props: { modelValue: 'a', options, label: 'Modo' } })
    await w.findAll('[role=radio]')[0].trigger('keydown', { key: 'ArrowLeft' })
    expect(w.emitted('update:modelValue')[0]).toEqual(['c'])
  })
})

describe('UiSheet', () => {
  it('dialog semantics when open', async () => {
    const w = mount(UiSheet, { props: { open: true, title: 'T' }, slots: { default: 'x' }, attachTo: document.body })
    await nextTick()
    const d = document.body.querySelector('[role=dialog]')
    expect(d).toBeTruthy()
    expect(d.getAttribute('aria-modal')).toBe('true')
    expect(document.getElementById(d.getAttribute('aria-labelledby')).textContent).toBe('T')
    w.unmount()
  })
  it('closed renders nothing', () => {
    const w = mount(UiSheet, { props: { open: false } })
    expect(document.body.querySelector('[role=dialog]')).toBeNull()
    w.unmount()
  })
  it('Esc emits close', async () => {
    const w = mount(UiSheet, { props: { open: true, title: 'T' }, attachTo: document.body })
    await nextTick()
    document.body
      .querySelector('[role=dialog]')
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    expect(w.emitted('update:open')[0]).toEqual([false])
    w.unmount()
  })
  it('backdrop click emits close', async () => {
    const w = mount(UiSheet, { props: { open: true, title: 'T' }, attachTo: document.body })
    await nextTick()
    document.body.querySelector('[data-sheet-backdrop]').click()
    expect(w.emitted('update:open')[0]).toEqual([false])
    w.unmount()
  })
  it('restores focus on close', async () => {
    const btn = document.createElement('button')
    document.body.appendChild(btn)
    btn.focus()
    const w = mount(UiSheet, { props: { open: false, title: 'T' }, attachTo: document.body })
    await w.setProps({ open: true })
    await nextTick()
    await nextTick()
    expect(document.activeElement).not.toBe(btn)
    await w.setProps({ open: false })
    await nextTick()
    expect(document.activeElement).toBe(btn)
    w.unmount()
    btn.remove()
  })
})
