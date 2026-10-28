import { describe, it, expect } from 'vitest'
import { parseDjangoErrors } from '../errors'

const err = (data, status = 400) => ({ response: { data, status } })

describe('parseDjangoErrors', () => {
  it('resposta em lista simples', () => {
    expect(parseDjangoErrors(err(['Já existe disponibilidade neste período para este dia']))).toBe(
      'Já existe disponibilidade neste período para este dia',
    )
  })

  it('lista com varios itens junta com espaco', () => {
    expect(parseDjangoErrors(err(['A.', 'B.']))).toBe('A. B.')
  })

  it('non_field_errors', () => {
    expect(parseDjangoErrors(err({ non_field_errors: ['Horário inválido.'] }))).toBe('Horário inválido.')
  })

  it('detail', () => {
    expect(parseDjangoErrors(err({ detail: 'Not found.' }, 404))).toBe('Não encontrado.')
  })
})

describe('parseFieldErrors', () => {
  it('traduz a primeira mensagem de cada campo', async () => {
    const { parseFieldErrors } = await import('../errors')
    expect(
      parseFieldErrors({ email: ['User with this Email already exists.'], cpf: ['CPF inválido.'] }),
    ).toEqual({ email: 'Já existe um usuário com este email.', cpf: 'CPF inválido.' })
  })

  it('ignora entradas que nao sao objeto', async () => {
    const { parseFieldErrors } = await import('../errors')
    expect(parseFieldErrors(null)).toEqual({})
    expect(parseFieldErrors('x')).toEqual({})
  })
})
