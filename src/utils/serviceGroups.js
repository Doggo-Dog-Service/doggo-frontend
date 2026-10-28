const startMs = (s) => new Date(s.start_datetime ?? s.created_at).getTime()

function sameLocalDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

export function groupServices(services, now = new Date()) {
  const groups = { today: [], upcoming: [], past: [] }
  for (const service of services ?? []) {
    const start = new Date(service.start_datetime ?? service.created_at)
    if (service.status === 3 || sameLocalDay(start, now)) groups.today.push(service)
    else if (start > now && (service.status === 1 || service.status === 2)) groups.upcoming.push(service)
    else groups.past.push(service)
  }
  groups.today.sort((a, b) => startMs(a) - startMs(b))
  groups.upcoming.sort((a, b) => startMs(a) - startMs(b))
  groups.past.sort((a, b) => startMs(b) - startMs(a))
  return groups
}
