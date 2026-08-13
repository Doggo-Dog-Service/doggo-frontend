import api from "./axios";

export const getReviews = (params = {}) => {
    return api.get('/reviews/', { params })
}

export const postReview = (data) => {
    return api.post('/reviews/', data)
}

export const updateReview = (id, data) => {
    return api.patch(`/reviews/${id}/`, data)
}

export const deleteReview = (id) => {
    return api.delete(`/reviews/${id}/`)
}