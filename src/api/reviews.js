import api from "./axios";

export const getReviews = (params = {}) => {
    return api.get('/reviews/', { params })
}

