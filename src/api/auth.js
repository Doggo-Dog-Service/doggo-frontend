import api from "./axios";

export const accessTokenRequest = (data) => {
    return api.post('/token/', data)
}

export const refreshTokenRequest = (refresh) => {
    return api.post('/token/refresh/', { refresh })
}

export const meRequest = () => {
    return api.get('/profile/')
}

export const createUser = (data) => {
    return api.post('/users/', data)
}

export const deleteUser = (id) => {
    return api.delete(`/users/${id}/`)
}