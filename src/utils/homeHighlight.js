const time = (v) => new Date(v).getTime()

function pickBy(list, key, pickLatest) {
  return list.reduce((best, s) => {
    if (!best) return s
    return pickLatest ? (time(s[key]) > time(best[key]) ? s : best) : time(s[key]) < time(best[key]) ? s : best
  }, null)
}

export function pickHomeHighlight(services, now = new Date()) {
  const list = Array.isArray(services) ? services : []

  const live = pickBy(
    list.filter((s) => s.status === 3),
    'started_at',
    true,
  )
  if (live) return { kind: 'live', service: live }

  const next = pickBy(
    list.filter((s) => s.status === 2 && time(s.start_datetime) > now.getTime()),
    'start_datetime',
    false,
  )
  if (next) return { kind: 'next', service: next }

  const pending = pickBy(
    list.filter((s) => s.status === 1),
    'created_at',
    true,
  )
  if (pending) return { kind: 'pending', service: pending }

  return { kind: 'empty', service: null }
}
