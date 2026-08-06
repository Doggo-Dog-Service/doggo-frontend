import * as petApi from '@/api/pet'

export const getPets = async (params = {}) => {
  try {
    const { data } = await petApi.getPets(params)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar os pets',
      status: error.response?.status,
    }
  }
}

export const getPet = async (id) => {
  try {
    const { data } = await petApi.getPet(id)
    return data
  } catch(error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao buscar o pet',
      status: error.response?.status,
    }
  }
}

export const createPet = async(payload) => {
  try {
    const { data } = await petApi.createPet(payload)
    return data
  } catch(error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao criar o pet',
      status: error.response?.status,
    }
  }
}

export const updatePet = async (id, payload) => {
  try {
    const { data } = await petApi.updatePet(id, payload)
    return data
  } catch(error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao atualizar as informações do pet',
      status: error.response?.status,
    }
  }
}

export const deletePet = async (id) => {
  try {
    const { data } = await petApi.deletePet(id)
    return data
  } catch(error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao deletar o pet',
      status: error.response?.status,
    }
  }
}

