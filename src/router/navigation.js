import { Home, Search, Footprints, PawPrint, UserRound, Sun, Inbox, CalendarDays } from 'lucide-vue-next'

export const NAV_ITEMS = [
  { mode: 'client', name: 'home-view', label: 'Início', icon: Home, to: { name: 'home-view' } },
  { mode: 'client', name: 'provider-list-view', label: 'Buscar', icon: Search, to: { name: 'provider-list-view' } },
  { mode: 'client', name: 'services-view', label: 'Passeios', icon: Footprints, to: { name: 'services-view' } },
  { mode: 'client', name: 'pets-view', label: 'Pets', icon: PawPrint, to: { name: 'pets-view' } },
  { mode: 'client', name: 'profile-view', label: 'Perfil', icon: UserRound, to: { name: 'profile-view' } },
  { mode: 'provider', name: 'provider-today-view', label: 'Hoje', icon: Sun, to: { name: 'provider-today-view' } },
  { mode: 'provider', name: 'provider-requests-view', label: 'Pedidos', icon: Inbox, to: { name: 'provider-requests-view' } },
  { mode: 'provider', name: 'agenda-view', label: 'Agenda', icon: CalendarDays, to: { name: 'agenda-view' } },
  { mode: 'provider', name: 'profile-view', label: 'Perfil', icon: UserRound, to: { name: 'profile-view' } },
]

export function navItemsFor(mode) {
  return NAV_ITEMS.filter((item) => item.mode === mode)
}

export function homeRouteFor(mode) {
  return { name: mode === 'provider' ? 'provider-today-view' : 'home-view' }
}

// Aba do menu que representa a rota atual (inclui telas internas, como detalhe de serviço).
export function activeTabName(route, mode) {
  if (route.meta?.tab) return route.meta.tab
  if (route.name === 'service-view') return mode === 'provider' ? 'provider-today-view' : 'services-view'
  return route.name
}

export function isTabRoute(route, mode) {
  return navItemsFor(mode).some((item) => item.name === route.name)
}
