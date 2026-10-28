<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { AlertCircle, Footprints, SearchX, ShieldAlert } from 'lucide-vue-next'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import AppButton from '@/components/buttons/AppButton.vue'
import UiSkeleton from '@/components/ui/UiSkeleton.vue'
import ServiceCard from '@/components/cards/ServiceCard.vue'
import { serviceStatus } from '@/utils/serviceStatus'
import { groupServices } from '@/utils/serviceGroups'
import { filterServices, buildServiceParams } from '@/utils/serviceFilters'
import { useServiceStore } from '@/stores/services'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const serviceStore = useServiceStore()
const authStore = useAuthStore()

// Filtro vindo da rota (/hoje, /pedidos) ou de ?filtro=. Sem filtro: lista completa + chips de status.
const routeFilter = computed(() => route.meta.filter ?? route.query.filtro ?? 'todos')
const hasRouteFilter = computed(() => ['ativos', 'pendentes'].includes(routeFilter.value))

const selectedStatus = ref(0)

// Passeador ainda não aprovado não aparece na busca: avisa em "Hoje".
const verificationStatus = computed(() => {
  if (routeFilter.value !== 'ativos' || authStore.mode !== 'provider') return null
  const profile = authStore.user?.provider_profile
  return ['pending', 'rejected'].includes(profile?.verification_status) ? profile.verification_status : null
})

const services = computed(() => filterServices(serviceStore.serivces, routeFilter.value))

const TITLES = {
  1: 'Serviços Em Análise',
  2: 'Serviços Confirmados',
  3: 'Serviços Em Andamento',
  4: 'Serviços Concluídos',
  5: 'Serviços Cancelados',
  6: 'Serviços Recusados',
}
const titleLabel = computed(() => {
  if (routeFilter.value === 'ativos') return 'Passeios de hoje'
  if (routeFilter.value === 'pendentes') return 'Pedidos'
  return TITLES[selectedStatus.value] ?? 'Todos os Serviços'
})

const emptyText = computed(() => {
  if (routeFilter.value === 'ativos') return 'Nenhum passeio confirmado ou em andamento.'
  if (routeFilter.value === 'pendentes') return 'Nenhum pedido aguardando resposta.'
  return 'Nenhum serviço encontrado.'
})

const isSelected = (statusId) => selectedStatus.value === statusId
function select(statusId) {
  selectedStatus.value = statusId === selectedStatus.value ? 0 : statusId
}

const GROUP_TITLES = [
  { key: 'today', title: 'Hoje' },
  { key: 'upcoming', title: 'Próximos' },
  { key: 'past', title: 'Anteriores' },
]
const groups = computed(() => {
  const grouped = groupServices(services.value)
  return GROUP_TITLES.map(({ key, title }) => ({ key, title, items: grouped[key] })).filter(
    (group) => group.items.length > 0,
  )
})

// Mostra o outro participante: o tutor para o passeador e o passeador para o tutor.
const participant = (service) =>
  authStore.mode === 'provider'
    ? { name: service.client_name, picture: service.client_picture }
    : { name: service.provider_name, picture: service.provider_picture }

function load() {
  return serviceStore.getServices(
    buildServiceParams({
      filter: routeFilter.value,
      mode: authStore.mode,
      user: authStore.user,
      status: hasRouteFilter.value ? 0 : selectedStatus.value,
    }),
  )
}

onMounted(load)
watch(selectedStatus, load)
</script>

<template>
  <section class="flex flex-col gap-5">
    <h1 class="hidden text-display text-fg md:block">{{ titleLabel }}</h1>

    <div
      v-if="verificationStatus"
      role="status"
      :class="[
        'flex items-start gap-3 rounded-card border p-4 text-body',
        verificationStatus === 'rejected' ? 'border-danger bg-danger-soft text-danger' : 'border-warning bg-warning-soft text-warning',
      ]"
    >
      <ShieldAlert :size="20" class="mt-0.5 shrink-0" aria-hidden="true" />
      <p v-if="verificationStatus === 'pending'">Seu perfil está em análise. Você ainda não aparece na busca.</p>
      <p v-else>
        Seu perfil foi recusado<template v-if="authStore.user.provider_profile.verification_note">: {{ authStore.user.provider_profile.verification_note }}</template>.
        <RouterLink :to="{ name: 'profile-view' }" class="font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-primary">
          Ir para o Perfil
        </RouterLink>
      </p>
    </div>

    <ul
      v-if="!hasRouteFilter"
      class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0"
      aria-label="Filtrar por status"
    >
      <li v-for="status in serviceStatus" :key="status.id" class="shrink-0">
        <button
          type="button"
          :aria-pressed="isSelected(status.id)"
          :class="[
            'min-h-11 cursor-pointer rounded-full border px-4 text-body font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-primary',
            isSelected(status.id)
              ? 'border-primary bg-primary text-primary-fg'
              : 'border-line bg-surface text-fg hover:bg-surface-muted',
          ]"
          @click="select(status.id)"
        >
          {{ status.name }}
        </button>
      </li>
    </ul>

    <div v-if="serviceStore.loading" class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Carregando serviços">
      <UiSkeleton v-for="n in 3" :key="n" shape="rect" />
    </div>
    <UiEmptyState
      v-else-if="serviceStore.serviceError"
      :icon="AlertCircle"
      title="Não foi possível carregar os passeios"
    >
      <template #action>
        <AppButton text="Tentar novamente" @event="load" />
      </template>
    </UiEmptyState>
    <template v-else-if="services.length > 0">
      <section
        v-for="group in groups"
        :key="group.key"
        :data-testid="`group-${group.key}`"
        :aria-labelledby="`group-title-${group.key}`"
        class="flex flex-col gap-3"
      >
        <h2 :id="`group-title-${group.key}`" class="flex items-center gap-2 text-title text-fg">
          {{ group.title }}
          <span
            data-testid="count"
            class="rounded-full bg-surface-muted px-2 text-caption font-semibold text-fg-muted"
          >
            {{ group.items.length }}
          </span>
        </h2>
        <ul class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          <li v-for="service in group.items" :key="service.id">
            <ServiceCard
              :id="service.id"
              :participant-name="participant(service).name"
              :participant-picture="participant(service).picture"
              :pets="service.pets"
              :price="service.price"
              :status="service.status"
              :start-date-time="service.start_datetime"
            />
          </li>
        </ul>
      </section>
    </template>
    <UiEmptyState
      v-else
      :icon="hasRouteFilter ? Footprints : SearchX"
      :title="emptyText"
    />
  </section>
</template>
