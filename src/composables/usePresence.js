import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useClientStore } from '@/stores/clients'
import { useProviderStore } from '@/stores/provider'

export function usePresence() {
  const authStore = useAuthStore()
  const providerStore = useProviderStore()
  const clientStore = useClientStore()

  const setOnline = async () => {
    const user = authStore.user
    if (!user) return

    try {
      if (user.provider_profile) {
        const provider = await providerStore.fetchProvider(user.provider_profile?.id)

        if (provider && !provider.is_active) {
          await providerStore.updateProvider(provider.id, {
            is_active: true,
          })
        }
      }

      if (user.client_profile) {
        const client = await clientStore.fetchClient(user.client_profile?.id)

        if (client && !client.is_active) {
          await clientStore.updateClient(client.id, {
            is_active: true,
          })
        }
      }
    } catch (error) {
      console.log('Erro ao estar online', error)
    }
  }

  const setOffline = async () => {
    const user = authStore.user
    if (!user) return

    if(user.provider_profile) {
        await providerStore.updateProvider(user.provider_profile.id, {
            is_active: false
        })
    } else if(user.client_profile) {
        await clientStore.updateClient(user.client_profile.id, {
            is_active: false
        })
    }
  }

  onMounted(async () => {
    if(!authStore.user) {
        await authStore.fetchUser()
    }

    await setOnline()

    window.addEventListener('beforeunload', () => {
        setOffline()
    })
  })
}
