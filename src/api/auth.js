import api from "./axios";

export const accessTokenRequest = (data) => {
    return api.post('/token/', data)
}

export const refreshTokenRequest = (refreshToken) => {
    return api.post('/refresh/')
}

export const meRequest = () => {
    return api.post('/users/me/')
}