import * as serviceApi from '@/api/services'

export const getTypeServices = async (params) => {
  try {
    const { data } = await serviceApi.getServiceTypes(params)
    return data
  } catch (error) {
    throw error
  }
}

export const getServices = async (params) => {
  try {
    const { data } = await serviceApi.getServices(params)
    return data
  } catch (error) {
    throw error
  }
}

export const postService = async (payload) => {
  try {
    const { data } = await serviceApi.postService(payload)
    return data
  } catch (error) {
    throw error
  }
}

export const updateService = async (payload) => {
  try {
    const { data } = await serviceApi.updateService(payload)
    return data
  } catch (error) {
    throw error
  }
}
