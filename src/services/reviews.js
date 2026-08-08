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

export const postReview = async (payload) => {
  try {
    const { data } = await reviewApi.postReview(payload)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao postar avaliação',
      status: error.response?.status,
    }
  }
}

export const updateReview = async (id, payload) => {
  try {
    const { data } = await reviewApi.updateReview(id, payload)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao atualizar avaliação',
      status: error.response?.status,
    }
  }
}

export const deleteReview = async (id) => {
  try {
    const { data } = await reviewApi.deleteReview(id)
    return data
  } catch (error) {
    throw {
      message: error.response?.data?.detail || 'Erro ao deletar atualizção',
      status: error.response?.status,
    }
  }
}
