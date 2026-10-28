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
