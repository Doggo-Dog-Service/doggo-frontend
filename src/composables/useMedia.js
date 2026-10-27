import * as mediaService from '@/services/mediaService'
import { ref } from 'vue'
import notify from '@/utils/notify'

export function useMedia() {

  const loading = ref(false)
  const postImage = async ({ file, description }) => {
    try {
      loading.value = true
      const data = await mediaService.postImage({ file, description })
      return data
    } catch (error) {
      notify.error(error?.message)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    postImage
  }
}
