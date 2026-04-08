import api from "./axios";

export const accessTokenRequest = (data) => {
    return api.post('/token/', data)
}

export const refreshTokenRequest = (refreshToken) => {
    return api.post('/token/refresh/')
}

export const meRequest = () => {
    return api.get('/profile/')
}