import { describe, it, expect } from 'vitest'
import { onlyDigits, formatCpf, formatPhone } from '../masks'

describe('masks', () => {
  it('onlyDigits', () => {
    expect(onlyDigits('(47) 9-9')).toBe('4799')
    expect(onlyDigits(null)).toBe('')
  })
  it('formatCpf completo e parcial', () => {
    expect(formatCpf('52998224725')).toBe('529.982.247-25')
    expect(formatCpf('5299')).toBe('529.9')
    expect(formatCpf('529982')).toBe('529.982')
    expect(formatCpf('5299822472599')).toBe('529.982.247-25')
    expect(formatCpf('')).toBe('')
  })
  it('formatPhone celular, fixo e parcial', () => {
    expect(formatPhone('47999990001')).toBe('(47) 99999-0001')
    expect(formatPhone('4733330000')).toBe('(47) 3333-0000')
    expect(formatPhone('4')).toBe('(4')
    expect(formatPhone('47')).toBe('(47')
    expect(formatPhone('479')).toBe('(47) 9')
    expect(formatPhone('479999')).toBe('(47) 9999')
    expect(formatPhone('')).toBe('')
  })
})
