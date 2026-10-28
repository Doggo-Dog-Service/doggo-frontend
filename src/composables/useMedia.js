import * as mediaService from '@/services/mediaService'
import { ref } from 'vue'
import notify from '@/utils/notify'
import { parseDjangoErrors } from '@/utils/errors'

export function useMedia() {

  const loading = ref(false)
  const postImage = async ({ file, description }) => {
    try {
      loading.value = true
      const data = await mediaService.postImage({ file, description })
      return data
    } catch (error) {
      notify.error(parseDjangoErrors(error))
    } finally {
      loading.value = false
    }
  }

  const postDocument = async ({ file, description }) => {
    try {
      loading.value = true
      return await mediaService.postDocument({ file, description })
    } catch (error) {
      notify.error(parseDjangoErrors(error))
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    postImage,
    postDocument
  }
}
