import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppInput from '../AppInput.vue'
import TextInput from '../TextInput.vue'

describe.each([
  ['AppInput', AppInput, 'input'],
  ['TextInput', TextInput, 'textarea'],
])('%s', (_n, Comp, tag) => {
  it('shows error with aria wiring', () => {
    const w = mount(Comp, { props: { label: 'Nome', error: 'Obrigatório' } })
    const el = w.find(tag)
    expect(w.text()).toContain('Obrigatório')
    expect(el.attributes('aria-invalid')).toBe('true')
    const id = el.attributes('aria-describedby')
    expect(id).toBeTruthy()
    expect(w.find('#' + id).text()).toBe('Obrigatório')
  })
  it('associates label with control', () => {
    const w = mount(Comp, { props: { label: 'Nome' } })
    const id = w.find(tag).attributes('id')
    expect(id).toBeTruthy()
    expect(w.find('label').attributes('for')).toBe(id)
  })
  it('no aria-invalid without error; hint described', () => {
    const w = mount(Comp, { props: { label: 'Nome', hint: 'Dica' } })
    expect(w.find(tag).attributes('aria-invalid')).toBeUndefined()
    const id = w.find(tag).attributes('aria-describedby')
    expect(w.find('#' + id).text()).toBe('Dica')
  })
  it('keeps v-model', async () => {
    const w = mount(Comp, { props: { modelValue: '', 'onUpdate:modelValue': (v) => w.setProps({ modelValue: v }) } })
    await w.find(tag).setValue('abc')
    expect(w.props('modelValue')).toBe('abc')
  })
})
