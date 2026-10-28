// Papel de passeador escolhido no cadastro mas ainda sem perfil criado (retomada após recarregar).
const KEY = 'doggo-signup-pending'

export function readSignupPending() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY))
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

export function setProviderPending() {
  try {
    localStorage.setItem(KEY, JSON.stringify({ provider: true }))
  } catch {
    // armazenamento bloqueado: segue sem persistir
  }
}

export function clearSignupPending() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // armazenamento bloqueado
  }
}

// Tutor já criado que ainda precisa concluir o perfil de passeador.
export function hasPendingProvider(user) {
  return !!(user?.client_profile && !user?.provider_profile && readSignupPending().provider === true)
}
