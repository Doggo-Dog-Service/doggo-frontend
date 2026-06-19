import * as mediaService from '@/services/mediaService'
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'

export function useMedia() {
  const $toast = useToast()

  const loading = ref(false)
  const postImage = async ({ file, description }) => {
    try {
      loading.value = true
      const data = await mediaService.postImage({ file, description })
      return data
    } catch (error) {
      $toast.error(error, {
        position: 'top-right',
        duration: 3000,
        type: 'error',
      })
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    postImage
  }
}
