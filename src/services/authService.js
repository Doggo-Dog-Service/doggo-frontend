import { accessTokenRequest, refreshTokenRequest, meRequest, createUser, deleteUser } from '@/api/auth'
import {
  getRefreshToken,
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  clearTokens,
} from '@/utils/token'

export const login = async (credentials) => {
  const refreshToken = getRefreshToken()

  if (refreshToken) {
    try {
      const { data } = await refreshTokenRequest(refreshToken)
      const accessToken = data.access

      if (accessToken) {
        setAccessToken(accessToken)
      }
    } catch (error) {
      throw {
        message: error.response?.data?.detail || 'Erro ao fazer login',
        status: error.response?.status,
      }
    }
  }

  try {
    const { data } = await accessTokenRequest(credentials)

    const { access, refresh } = data

    if (access && refresh) {
      setAccessToken(access)
      setRefreshToken(refresh)
    }
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao fazer login',
      status: error.response?.status,
    }
  }
}

export const getMe = async () => {
  try {
    const access = getAccessToken()
    if (access) {
      const { data } = await meRequest()
      return data
    } else {
      const refresh = getRefreshToken()
      if (refresh) {
        const { data: refreshData } = await refreshTokenRequest(refresh)
        setAccessToken(refreshData.access)

        const { data } = await meRequest()
        return data
      } 
    }

    throw {
      message: 'Usuário não autenticado',
      status: 401,
    }
  } catch (error) {
    console.error(error)
    throw {
      message: error.response?.data?.detail || 'Erro inesperado ao buscar perfil',
      status: error.response?.status,
    }
  }
}

export const createBaseUser = async (payload) => {
  try {
    const { data } = await createUser(payload);
    return data
  } catch(error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao criar usuário',
      status: error.response?.status,
    }
  }
}

export const logout = () => {
  clearTokens()
}

export const deleteUserById = async (id) => {
  try {
    const { data } = await deleteUser(id)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao deletar usuário',
      status: error.response?.status,
    }
  }
}
