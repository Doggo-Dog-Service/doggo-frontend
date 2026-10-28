<script setup>
import InfoCard from '@/components/cards/InfoCard.vue'
import ServicesCard from '@/components/cards/ServicesCard.vue'
import SearchBar from '@/components/inputs/SearchBar.vue'
import SearchCard from '@/components/cards/SearchCard.vue'
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import UserCard from '@/components/cards/UserCard.vue'
import UiEmptyState from '@/components/ui/UiEmptyState.vue'
import { BriefcaseBusiness, Home, Loader2, MapPinOff, PawPrint } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useAuthStore } from '@/stores/auth'
import { useServiceTypeStore } from '@/stores/serviceType'
import { useSearchStore } from '@/stores/search'

const providerStore = useProviderStore()
const authStore = useAuthStore()
const serviceTypeStore = useServiceTypeStore()
const searchStore = useSearchStore()

const services = [
  {
    title: 'Dog Sitter',
    description: 'Cuidador do pet na sua própria casa',
    icon: Home,
    type: 'green',
    link: '/',
  },
  {
    title: 'Dog Walking',
    description: 'Passeio para os pets gastarem a energia, caso sua rotina esteja muito corrida',
    icon: PawPrint,
    type: 'default',
    link: '/',
  },
]

const currentTypeService = ref(0)
const searchedList = ref(false)
const searchBarData = ref('')

async function selectTypeService(typeId) {
  await providerStore.fetchProviders({
    service_type: typeId,
  })
  currentTypeService.value = typeId
}

onMounted(async () => {
  await Promise.all([
    providerStore.fetchProviders(),
    providerStore.countProviders(),
    serviceTypeStore.getTypeServices(),
  ])
  selectTypeService(serviceTypeStore.typeServices[0].id)
})

let timeout = null

watch(searchBarData, (value) => {
  clearTimeout(timeout)

  timeout = setTimeout(() => {
    if (value.length >= 3) {
      searchStore.globalSearch(value.trim())
    }
  }, 300)
})
</script>

<template>
  <div class="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-10">
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h1 v-if="authStore.user" class="text-display text-fg">
          Olá {{ authStore.user?.full_name }}!
        </h1>
        <h1 class="text-display text-fg">
          O que seu <span class="text-primary">pet</span> precisa?
        </h1>
        <p class="text-body text-fg-muted">
          Encontre profissionais de confiança perto de você.
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <SearchBar
          class="col-span-2"
          placeholder="Buscar profissionais ou clientes"
          v-model="searchBarData"
          @focus="searchedList = true"
          @out="searchedList = false"
        >
          <template #list>
            <transition
              enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="searchedList"
                class="absolute inset-x-0 top-full z-20 mt-2 h-96 max-h-[60dvh] overflow-y-auto rounded-card border border-line bg-surface p-3 shadow-card"
                @mousedown.prevent
              >
                <div
                  v-if="searchStore.loading"
                  class="flex h-full w-full flex-col items-center justify-center"
                  role="status"
                  aria-label="Buscando"
                >
                  <Loader2 :size="32" :stroke-width="2" class="animate-spin text-primary" aria-hidden="true" />
                </div>
                <div
                  v-else-if="searchStore.searched.providers?.length > 0"
                  class="flex w-full flex-col gap-2"
                >
                  <SearchCard
                    v-for="(provider, index) in searchStore.searched.providers"
                    :key="index"
                    :id="provider.id"
                    :full_name="provider.full_name"
                    :profile_photo="provider.profile_picture"
                    :service="provider.service_type_name"
                    :classification="provider.classification ? provider.classification : '--'"
                    link="/provider/"
                  />
                </div>
                <div
                  v-else
                  class="flex h-full w-full flex-col items-center justify-center text-body text-fg-muted"
                >
                  <p v-if="searchBarData.length > 0">Nenhum resultado encontrado</p>
                  <p v-else>Procure por algum provedor ou usuário</p>
                </div>
              </div>
            </transition>
          </template>
        </SearchBar>
        <InfoCard
          class="col-span-2"
          :icon="BriefcaseBusiness"
          :info="providerStore.totalProviders"
          :description="providerStore.totalProviders == 1 ? 'Profissional' : 'Profissionais'"
        />
      </div>
    </section>
    <section class="flex flex-col gap-3">
      <h2 class="text-title text-fg">Serviços</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ServicesCard
          v-for="(service, index) in services"
          :key="index"
          :title="service.title"
          :description="service.description"
          :icon="service.icon"
          :type="service.type"
        />
      </div>
    </section>
    <section class="flex flex-col gap-4">
      <h2 class="text-title text-fg">Perto de você</h2>
      <div class="flex gap-2">
        <ChoseButton
          v-for="(typeService, index) in serviceTypeStore.typeServices"
          :key="index"
          :text="typeService.name"
          :selected="typeService.id === currentTypeService"
          @select="selectTypeService(typeService.id)"
        />
      </div>
      <div
        class="flex max-h-110 flex-col gap-3 overflow-y-auto"
        v-if="providerStore.providers && providerStore.providers.length > 0"
      >
        <UserCard
          v-for="(provider, index) in providerStore.providers"
          :key="index"
          :id="provider.id"
          :full_name="provider.full_name"
          :service_name="provider.service_type_name"
          :price_per_hour="provider.price_per_hour"
          :price_per_day="provider.price_per_day"
          :is_active="provider.is_active"
          :profile_photo="provider.profile_picture"
          :classification="provider.classification"
        />
      </div>
      <UiEmptyState
        v-else
        :icon="MapPinOff"
        title="Não conseguimos encontrar nenhum provedor perto da sua região"
      />
    </section>
  </div>
</template>
