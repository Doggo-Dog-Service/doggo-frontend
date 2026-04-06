import { createRouter, createWebHistory } from 'vue-router'

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
    {
      path: '/provider/:id',
      name: 'provider-view',
      component: () => import('@/views/ProviderView.vue'),
      meta: {
        title: 'Provider',
        icon: 'mdi mdi-provider-outline',
        isView: true
      }
    },
  ],
})

export default router
