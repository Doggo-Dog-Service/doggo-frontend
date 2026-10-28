import * as availabilityApi from '@/api/availability'
import { parseDjangoErrors } from '@/utils/errors'

export const getAvailabilitySlots = async (params = {}) => {
  try {
    const { data } = await availabilityApi.getAvailabilitySlots(params)
    return data
  } catch (error) {
    throw {
      message: parseDjangoErrors(error),
      status: error.response?.status,
    }
  }
}

const toError = (error) => ({
  message: parseDjangoErrors(error),
  status: error.response?.status,
})

export const getMyAvailability = async () => {
  try {
    const { data } = await availabilityApi.listAvailability()
    return Array.isArray(data) ? data : (data.results ?? [])
  } catch (error) {
    throw toError(error)
  }
}

export const createAvailability = async (payload) => {
  try {
    const { data } = await availabilityApi.createAvailability(payload)
    return data
  } catch (error) {
    throw toError(error)
  }
}

export const removeAvailability = async (id) => {
  try {
    await availabilityApi.deleteAvailability(id)
  } catch (error) {
    throw toError(error)
  }
}
