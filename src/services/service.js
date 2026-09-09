import * as serviceApi from '../api/services'

export const getServices = async (params) => {
  try {
    const response = await serviceApi.getServices(params)
    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const getService = async (id) => {
  try {
    const response = await serviceApi.getService(id)
    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const createService = async (payload) => {
  try {
    const response = await serviceApi.createService(payload)
    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const updateService = async (id, payload) => {
  try {
    const response = await serviceApi.updateService(id, payload)
    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const deleteService = async (id) => {
  try {
    const response = await serviceApi.deleteService(id)
    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const startService = async (id) => {
  try {
    const response = await serviceApi.startService(id)

    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}