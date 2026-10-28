import '@mdi/font/css/materialdesignicons.css'
import '@/assets/css/main.css'
import 'vue3-toastify/dist/index.css'
import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import Vue3Toastify, { updateGlobalOptions } from 'vue3-toastify'
import { useAuthStore } from './stores/auth.js'
import { setUnauthorizedHandler } from './api/axios.js'
import { useTheme } from './composables/useTheme.js'

import App from './App.vue'
import router from './router'

const { resolved: resolvedTheme } = useTheme()

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
await authStore.inicialize()

app.use(router)
setUnauthorizedHandler(() => {
  authStore.clearSession()
  const current = router.currentRoute.value
  if (current.name === 'login-view') return
  router.push({ name: 'login-view', query: { redirect: current.fullPath } })
})
app.use(Vue3Toastify, {
  position: 'top-center',
  autoClose: 3000,
  limit: 3,
  theme: resolvedTheme.value,
})
watch(resolvedTheme, (theme) => updateGlobalOptions({ theme }))

app.mount('#app')
