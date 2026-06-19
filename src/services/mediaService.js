import * as mediaApi from '@/api/media'

export const postImage = async ({ file, description }) => {
  try {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('description', description)

    const { data } = await mediaApi.postImage(formData)
    return data
  } catch (error) {
    throw error
  }
}
