import * as providerApi from '@/api/providers'

export const fetchProviders = async (params) => {
  try {
    const { data } = await providerApi.getProviders(params)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar provedores',
      status: error.response?.status,
    }
  }
}

export const fetchProvider = async (id) => {
  try {
    const { data } = await providerApi.getProvider(id)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar o provedor',
      status: error.response?.status,
    }
  }
}

export const createProvider = async (payload) => {
  try {
    const { data } = await providerApi.createProvider(payload)
    return data
  } catch (error) {
    throw error
  }
}

export const updateProvider = async (id, payload) => {
  try {
    const { data } = await providerApi.updateProvider(id, payload)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao atualizar o provedor',
      status: error.response?.status,
    }
  }
}

export const deleteProvider = async (id) => {
  try {
    const { data } = await providerApi.deleteProvider(id)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao deletar o provedor',
      status: error.response?.status,
    }
  }
}

export const fetchMyDocuments = async () => {
  try {
    const { data } = await providerApi.getMyDocuments()
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar os documentos',
      status: error.response?.status,
    }
  }
}

export const saveMyDocument = async (payload) => {
  try {
    const { data } = await providerApi.saveMyDocument(payload)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao salvar o documento',
      status: error.response?.status,
    }
  }
}
