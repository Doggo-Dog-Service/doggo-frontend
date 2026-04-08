import { accessTokenRequest, refreshTokenRequest, meRequest } from '@/api/auth'
import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '@/utils/token'

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
        status: error.response?.status
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
      status: error.response?.status
    }
  }
}

export const getMe = async () => {
  try {
    const { data } = await meRequest();
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.datail || 'Erro ao buscar perfil',
      status: error.response?.status
    }
  }
}

export const logout = () => {
  clearTokens()
}
