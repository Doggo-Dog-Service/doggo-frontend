import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '@/utils/token'
import { HomeIcon, BriefcaseIcon } from '@heroicons/vue/24/outline'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home-view',
          component: () => import('@/views/HomeView.vue'),
          meta: {
            title: 'Início',
            icon: HomeIcon,
            isView: true,
            requiresAuth: true,
          },
        },
        {
          path: 'provider/',
          name: 'provider-list-view',
          component: () => import('@/views/ProviderListView.vue'),
          meta: {
            requiresAuth: true,
            isView: true,
            title: 'Profissionais',
            icon: BriefcaseIcon
          },
        },
        {
          path: 'provider/:id/',
          component: () => import('@/views/ProviderView.vue'),
          meta: {
            requiresAuth: true
          }
        }
      ],
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login-view',
          component: () => import('@/views/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register-view',
          component: () => import('@/views/RegisterView.vue'),
        },
        {
          path: 'register/location/:serviceTypeId',
          name: 'register-location-view',
          component: () => import('@/views/RegisterLocationView.vue'),
          meta: {
            requiresAuth: true,
          },
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const isAuthenticated = !!getAccessToken()

  if (to.meta.requiresAuth && !isAuthenticated) {
    return '/auth/login'
  }
})

export default router
