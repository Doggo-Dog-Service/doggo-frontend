import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '@/utils/token'
import { useAuthStore } from '@/stores/auth'
import { homeRouteFor } from './navigation'

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
          meta: { title: 'Início', requiresAuth: true, mode: 'client' },
        },
        {
          path: 'provider/',
          name: 'provider-list-view',
          component: () => import('@/views/ProviderListView.vue'),
          meta: { title: 'Buscar', requiresAuth: true, mode: 'client' },
        },
        {
          path: 'provider/:id/',
          component: () => import('@/views/ProviderView.vue'),
          meta: { title: 'Profissional', requiresAuth: true, mode: 'client', tab: 'provider-list-view' },
        },
        {
          path: 'pets/',
          name: 'pets-view',
          component: () => import('@/views/PetView.vue'),
          meta: { title: 'Meus pets', requiresAuth: true, mode: 'client' },
        },
        {
          path: 'services/',
          name: 'services-view',
          component: () => import('@/views/ServicesView.vue'),
          meta: { title: 'Passeios', requiresAuth: true },
        },
        {
          path: 'service/:id',
          name: 'service-view',
          component: () => import('@/views/ServiceView.vue'),
          meta: { title: 'Passeio', requiresAuth: true, hideNav: true },
        },
        {
          path: 'scheduling/:providerId',
          name: 'scheduling-view',
          component: () => import('@/views/SchedulingView.vue'),
          meta: {
            title: 'Agendar passeio',
            requiresAuth: true,
            mode: 'client',
            hideNav: true,
            tab: 'provider-list-view',
          },
        },
        {
          path: 'hoje',
          name: 'provider-today-view',
          component: () => import('@/views/ServicesView.vue'),
          meta: { title: 'Hoje', requiresAuth: true, mode: 'provider', filter: 'ativos' },
        },
        {
          path: 'pedidos',
          name: 'provider-requests-view',
          component: () => import('@/views/ServicesView.vue'),
          meta: { title: 'Pedidos', requiresAuth: true, mode: 'provider', filter: 'pendentes' },
        },
        {
          path: 'agenda',
          name: 'agenda-view',
          component: () => import('@/views/AgendaView.vue'),
          meta: { title: 'Agenda', requiresAuth: true, mode: 'provider' },
        },
        {
          path: 'perfil',
          name: 'profile-view',
          component: () => import('@/views/ProfileView.vue'),
          meta: { title: 'Perfil', requiresAuth: true },
        },
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

export function createGuard(authStore) {
  return (to) => {
    const isAuthenticated = !!getAccessToken()

    if (to.meta.requiresAuth && !isAuthenticated) {
      return { name: 'login-view', query: { redirect: to.fullPath } }
    }

    const mode = authStore.mode
    if (to.meta.mode && mode && to.meta.mode !== mode) {
      return homeRouteFor(mode)
    }
  }
}

router.beforeEach((to) => createGuard(useAuthStore())(to))

export default router
