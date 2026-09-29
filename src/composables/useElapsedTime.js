import { onUnmounted, ref, watchEffect } from 'vue'

export const useElapsedTime = (startGetter, activeGetter) => {
  const elapsedSeconds = ref(0)

  let interval = null

  const clear = () => {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  const tick = () => {
    const startValue = startGetter()

    if (!startValue) {
      elapsedSeconds.value = 0
      return
    }

    const start = new Date(startValue).getTime()

    if (Number.isNaN(start)) {
      elapsedSeconds.value = 0
      return
    }

    elapsedSeconds.value = Math.max(0, Math.floor((Date.now() - start) / 1000))
  }

  watchEffect(() => {
    clear()

    if (activeGetter() && startGetter()) {
      tick()
      interval = setInterval(tick, 1000)
    } else {
      elapsedSeconds.value = 0
    }
  })

  onUnmounted(clear)

  return {
    elapsedSeconds,
  }
}