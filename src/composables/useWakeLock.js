import { onBeforeUnmount, ref } from 'vue'

export function useWakeLock() {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const active = ref(false)
  let wanted = false
  let sentinel = null

  let pending = null

  function acquire() {
    if (!supported || sentinel) return Promise.resolve()
    if (pending) return pending
    pending = (async () => {
      try {
        const lock = await navigator.wakeLock.request('screen')
        if (!wanted) {
          try { await lock.release() } catch { /* já liberado */ }
          return
        }
        sentinel = lock
        active.value = true
        lock.addEventListener('release', () => {
          if (sentinel === lock) sentinel = null
          active.value = false
        })
      } catch {
        active.value = false
      } finally {
        pending = null
      }
    })()
    return pending
  }

  async function request() {
    wanted = true
    await acquire()
  }

  async function release() {
    wanted = false
    const lock = sentinel
    sentinel = null
    active.value = false
    if (lock) {
      try { await lock.release() } catch { /* já liberado */ }
    }
  }

  function onVisibility() {
    if (wanted && document.visibilityState === 'visible') acquire()
  }

  if (supported && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility)
  }

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', onVisibility)
    release()
  })

  return { supported, active, request, release }
}
