import { accessTokenRequest, refreshTokenRequest, meRequest } from '@/api/auth'
import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from '@/utils/token'

export const login = async (credentials) => {
  const refreshToken = getRefreshToken()

  if (refreshToken) {
    try {
      const response = await refreshTokenRequest(refreshToken)
      const accessToken = response.data.access

      if (accessToken) {
        setAccessToken(accessToken)
      }

      return {
        type: 'refresh',
        response,
      }
    } catch (error) {
      console.log(error)
    }
  }

  try {
    const response = await accessTokenRequest(credentials)

    const { access, refresh } = response.data

    if (access && refresh) {
      setAccessToken(access)
      setRefreshToken(refresh)

      return {
        type: 'access',
        response,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getMe = async () => {
  return await meRequest()
}

export const logout = () => {
  clearTokens()
}
