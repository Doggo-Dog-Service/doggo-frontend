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
      console.log(error)
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
    console.log(error)
  }
}

export const getMe = async () => {
  return await meRequest()
}

export const logout = () => {
  clearTokens()
}
