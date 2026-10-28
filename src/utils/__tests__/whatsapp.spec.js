import { describe, it, expect } from 'vitest'
import { whatsappLink } from '../whatsapp'

describe('whatsappLink', () => {
  it('formata telefone com máscara e codifica texto', () => {
    expect(whatsappLink('(47) 99999-0001', 'Olá!')).toBe('https://wa.me/5547999990001?text=Ol%C3%A1!')
  })
  it('não duplica 55', () => {
    expect(whatsappLink('5547999990001', 'x')).toBe('https://wa.me/5547999990001?text=x')
  })
  it('12 dígitos já com 55 não duplica', () => {
    expect(whatsappLink('554799999000', 'x')).toBe('https://wa.me/554799999000?text=x')
  })
  it('null sem telefone', () => expect(whatsappLink(null, 'x')).toBeNull())
  it('null com telefone curto', () => expect(whatsappLink('123', 'x')).toBeNull())
})
