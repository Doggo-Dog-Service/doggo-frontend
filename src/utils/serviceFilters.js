const ACTIVE_STATUSES = [2, 3]
const PENDING_STATUS = 1

// Filtra no cliente a lista já carregada. Filtro desconhecido não altera a lista.
export function filterServices(list, filter) {
  if (filter === 'ativos') {
    return list
      .filter((s) => ACTIVE_STATUSES.includes(s.status))
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
  }
  if (filter === 'pendentes') {
    return list.filter((s) => s.status === PENDING_STATUS)
  }
  return list
}

const MAX_PAGE_SIZE = 100 // max_page_size do backend (app/pagination.py)

// Parâmetros de listagem escopados pelo perfil do modo atual (a API pagina em 10 por padrão).
export function buildServiceParams({ filter, mode, user, status }) {
  if (filter === 'pendentes') {
    return { status: PENDING_STATUS, provider: user?.provider_profile?.id }
  }
  const params = { page_size: MAX_PAGE_SIZE }
  if (filter === 'ativos' || mode === 'provider') params.provider = user?.provider_profile?.id
  else params.client = user?.client_profile?.id
  if (status) params.status = status
  return params
}
