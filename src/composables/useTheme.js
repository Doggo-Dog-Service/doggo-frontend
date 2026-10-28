import { computed, ref } from 'vue'

const STORAGE_KEY = 'doggo-theme'
const PREFERENCES = ['system', 'light', 'dark']
const THEME_COLORS = { light: '#F7F8FA', dark: '#0D1117' }

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return PREFERENCES.includes(value) ? value : 'system'
  } catch {
    return 'system'
  }
}

function writeStored(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // armazenamento bloqueado (ex.: navegação privada): segue sem persistir
  }
}

const media =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

const preference = ref(readStored())
const systemDark = ref(Boolean(media?.matches))
const resolved = computed(() => {
  if (preference.value === 'system') return systemDark.value ? 'dark' : 'light'
  return preference.value
})

function apply() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', resolved.value === 'dark')
  const meta = document.querySelector('meta[name=theme-color]')
  if (meta) meta.setAttribute('content', THEME_COLORS[resolved.value])
}

media?.addEventListener('change', (event) => {
  systemDark.value = event.matches
  if (preference.value === 'system') apply()
})

function setPreference(value) {
  if (!PREFERENCES.includes(value)) return
  preference.value = value
  writeStored(value)
  apply()
}

export function useTheme() {
  apply()
  return { preference, resolved, setPreference }
}
