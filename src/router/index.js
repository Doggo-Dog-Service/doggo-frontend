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
    }
  ],
})

export default router
