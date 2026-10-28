import { computed, ref } from 'vue'

// Estado compartilhado do cachorro das telas de autenticação.
// - focusMood: reação ao campo em foco (email, senha, outros).
// - flashMood: reação passageira (sucesso/erro) que se sobrepõe ao foco.
// - animated: só é true com o cachorro 3D montado e animando; sem ele nenhuma espera é aplicada.
const focusMood = ref('idle')
const flashMood = ref(null)
const animated = ref(false)
let flashTimer = null

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function useDogMood() {
  const mood = computed(() => flashMood.value ?? focusMood.value)

  function setFocusMood(name) {
    focusMood.value = name
  }

  function flash(name, ms = 1400) {
    clearTimeout(flashTimer)
    flashMood.value = name
    flashTimer = setTimeout(() => {
      flashMood.value = null
    }, ms)
  }

  // Mostra a reação e só espera quando o cachorro está visível e animado,
  // para a navegação não demorar à toa em fallback, reduced-motion ou testes.
  async function react(name, ms = 900) {
    flash(name, ms + 500)
    if (animated.value) await wait(ms)
  }

  function setAnimated(value) {
    animated.value = value
  }

  function reset() {
    clearTimeout(flashTimer)
    flashMood.value = null
    focusMood.value = 'idle'
    animated.value = false
  }

  return { mood, setFocusMood, flash, react, setAnimated, reset }
}
