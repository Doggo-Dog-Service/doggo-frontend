import * as clientApi from '@/api/clients'

export const fetchClients = async (params) => {
  try {
    const { data } = await clientApi.getClients(params)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar os clientes',
      status: error.response?.status,
    }
  }
}

export const fetchClient = async (id) => {
  try {
    const { data } = await clientApi.getClient(id);
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar o cliente',
      status: error.response?.status,
    }
  }
}

export const createClient = async (payload) => {
  try {
    const { data } = await clientApi.createClient(payload)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao criar o cliente',
      status: error.response?.status,
    }
  }
}

export const updateClient = async (id, payload) => {
  try {
    const { data } = await clientApi.updateClient(id, payload)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao atualizar o cliente',
      status: error.response?.status,
    }
  }
}

export const deleteClient = async (id) => {
  try {
    const { data } = await clientApi.deleteClient(id)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao deletar o cliente',
      status: error.response?.status,
    }
  }
}
