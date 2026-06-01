import * as searchApi from '@/api/search'

export const globalSearchService = async (query) => {
  try {
    const { data } = await searchApi.globalSearchRequest(query)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail,
      status: error.response?.status,
    }
  }
}
