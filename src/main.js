import '@mdi/font/css/materialdesignicons.css'
import '@/assets/css/main.css'
import 'vue-toast-notification/dist/theme-bootstrap.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ToastPlugin from 'vue-toast-notification'
import { useAuthStore } from './stores/auth.js'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const authStore = useAuthStore()
await authStore.inicialize()

app.use(router)
app.use(ToastPlugin)

app.mount('#app')
