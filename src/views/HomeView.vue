<script setup>
import InfoCard from '@/components/cards/InfoCard.vue'
import ServicesCard from '@/components/cards/ServicesCard.vue'
import SearchBar from '@/components/inputs/SearchBar.vue'
import SearchCard from '@/components/cards/SearchCard.vue'
import ChoseButton from '@/components/buttons/ChoseButton.vue'
import UserCard from '@/components/cards/UserCard.vue'
import { onMounted, ref, watch } from 'vue'
import { useProviderStore } from '@/stores/provider'
import { useAuthStore } from '@/stores/auth'
import { useServiceStore } from '@/stores/service'
import { useClientStore } from '@/stores/clients'
import { useSearchStore } from '@/stores/search'

const providerStore = useProviderStore()
const authStore = useAuthStore()
const serviceStore = useServiceStore()
const clientStore = useClientStore()
const searchStore = useSearchStore()

const services = [
  {
    title: 'Dog Sitter',
    description: 'Cuidador do pet na sua própria casa',
    icon: 'mdi mdi-home',
    type: 'green',
    link: '/',
  },
  {
    title: 'Dog Walking',
    description: 'Passeio para os pets gastarem a energia, caso sua rotina esteja muito corrida',
    icon: 'mdi mdi-paw',
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
    clientStore.countClients(),
    serviceStore.getServices(),
  ])
  selectTypeService(serviceStore.typeServices[0].id)
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
  <div
    class="flex flex-col gap-5 p-6 mb-19 text-doggo-black lg:grid md:grid-cols-2 lg:gap-10 md:justify-start md:max-h-screen"
  >
    <section class="flex flex-col gap-4">
      <div class="flex flex-col">
        <h1 v-if="authStore.user" class="text-2xl font-bold">
          Olá {{ authStore.user?.full_name }}!
        </h1>
        <h1 class="text-2xl font-bold">
          O que seu <span class="text-doggo-green">pet</span> precisa?
        </h1>
        <p class="text-doggo-black/50 font-semibold">
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
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
            >
              <div
                v-if="searchedList"
                class="absolute w-full h-100 top-16 right-0 bg-white rounded-xl border border-doggo-gray transition-all duration-200 p-3 overflow-y-auto"
                @mousedown.prevent
              >
                <div
                  v-if="searchStore.loading"
                  class="w-full h-full flex flex-col items-center justify-center"
                >
                  <div
                    class="w-10 h-10 rounded-full border-l-2 border-doggo-green animate-spin"
                  ></div>
                </div>
                <div
                  v-else-if="
                    searchStore.searched.providers?.length > 0
                  "
                  class="w-full h-full flex flex-col gap-2"
                >
                  <SearchCard
                    v-for="(provider, index) in searchStore.searched.providers"
                    :key="index"
                    :id="provider.id"
                    :full_name="provider.full_name"
                    :profile_photo="provider.profile_picture"
                    :service="provider.service_type_name"
                    :classification="provider.classification ? provider.classification : '--'"
                    :link="`/provider/${provider.id}`"
                    />
                </div>
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center text-doggo-green"
                >
                  <p v-if="searchBarData.length > 0">Nenhum resultado encontrado</p>
                  <p v-else>Procure por algum provedor ou usuário</p>
                </div>
              </div>
            </transition>
          </template>
        </SearchBar>
        <InfoCard
          icon="mdi mdi-briefcase-variant"
          :info="providerStore.totalProviders"
          :description="providerStore.totalProviders == 1 ? 'Profissional' : 'Profissionais'"
        />
        <InfoCard
          icon="mdi mdi-account"
          :info="clientStore.totalClients"
          :description="clientStore.totalClients == 1 ? 'Cliente' : 'Clientes'"
        />
      </div>
    </section>
    <section class="flex flex-col gap-2">
      <h2 class="text-lg font-bold">Serviços</h2>
      <div class="grid grid-cols-2 gap-2">
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
      <h2 class="text-lg font-bold">Perto de você</h2>
      <div class="flex gap-2">
        <ChoseButton
          v-for="(typeService, index) in serviceStore.typeServices"
          :key="index"
          :text="typeService.name"
          :selected="typeService.id === currentTypeService"
          @select="selectTypeService(typeService.id)"
        />
      </div>
      <div
        class="flex flex-col gap-2 max-h-110 overflow-y-auto"
        v-if="providerStore.providers && providerStore.providers.length > 0"
      >
        <UserCard
          v-for="(provider, index) in providerStore.providers"
          :key="index"
          :id="provider.id"
          :full_name="provider.full_name"
          :service_name="provider.service_type_name"
          :fixed_latitude="provider.fixed_latitude"
          :fixed_longitude="provider.fixed_longitude"
          :price_per_hour="provider.price_per_hour"
          :price_per_day="provider.price_per_day"
          :is_active="provider.is_active"
          :profile_photo="provider.profile_picture"
          :classification="provider.classification ? provider.classification : '--'"
        />
      </div>
      <div v-else class="text-center flex flex-col items-center justify-center py-10">
        <p class="text-xl text-doggo-green font-semibold md:text-base">
          Não conseguimos encontrar nenhum provedor perto da sua região
        </p>
      </div>
    </section>
  </div>
</template>
