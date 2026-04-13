import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '@/utils/token'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home-view',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'Home',
        icon: 'mdi mdi-home-outline',
        isView: true,
      }
    },
    {
      path: '/login',
      name: 'login-view',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register-view',
      component: () => import('@/views/RegisterView.vue'),
    },

  ],
})

export default router
