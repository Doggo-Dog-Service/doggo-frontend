import * as reviewApi from '@/api/reviews'

export const getReviews = async (params) => {
  try {
    const { data } = await reviewApi.getReviews(params)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao pegar avaliações',
      status: error.response?.status,
    }
  }
}
