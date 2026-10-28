// Aceita apenas caminhos internos ("/x"); evita open redirect.
export const safeRedirect = (value) => {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  return value
}
