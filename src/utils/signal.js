const toMs = (value) => new Date(value).getTime()

export function signalState(lastAt, now = new Date()) {
  if (!lastAt) return 'none'
  const seconds = (toMs(now) - toMs(lastAt)) / 1000
  if (seconds < 30) return 'live'
  if (seconds <= 60) return 'stale'
  return 'lost'
}

export function minutesSince(lastAt, now = new Date()) {
  const diff = toMs(now) - toMs(lastAt)
  return Math.max(0, Math.floor(diff / 60000))
}
