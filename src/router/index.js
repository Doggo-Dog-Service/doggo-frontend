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
        isView: true
      }
    },
  ],
})

router.beforeEach((to, from) => {
  const isAuthenticated = !!getAccessToken();

  if(to.meta.requiresAuth && !isAuthenticated) {
    return '/login'
  }

  return true
})

export default router
