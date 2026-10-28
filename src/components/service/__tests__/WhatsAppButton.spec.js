import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WhatsAppButton from '../WhatsAppButton.vue'

describe('WhatsAppButton', () => {
  it('renders link with wa.me, new tab, safe rel', () => {
    const w = mount(WhatsAppButton, { props: { phone: '(47) 99999-0001' } })
    const a = w.get('a')
    expect(a.attributes('href')).toBe(
      'https://wa.me/5547999990001?text=Ol%C3%A1!%20Sobre%20o%20passeio%20no%20DOGGO.',
    )
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toContain('noopener')
    expect(w.text()).toContain('Falar no WhatsApp')
  })

  it.each([null, '', '123'])('renders nothing for phone %s', (phone) => {
    const w = mount(WhatsAppButton, { props: { phone } })
    expect(w.find('a').exists()).toBe(false)
  })
})
