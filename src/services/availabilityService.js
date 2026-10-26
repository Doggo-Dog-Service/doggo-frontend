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
