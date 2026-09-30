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

export const confirmService = async (id) => {
  try {
    const response = await serviceApi.confirmService(id)

    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const rejectService = async (id) => {
  try {
    const response = await serviceApi.rejectService(id)

    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const completeService = async (id) => {
  try {
    const response = await serviceApi.completeService(id)

    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const cancelService = async (id) => {
  try {
    const response = await serviceApi.cancelService(id)

    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}

export const getServiceRoute = async (id) => {
  try {
    const response = await serviceApi.getServiceRoute(id)

    return response.data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}