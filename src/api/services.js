import api from "./axios";

export const getServices = (params) => {
    return api.get('/services/', { params })
}

export const getService = (id) => {
    return api.get(`/services/${id}/`)
}

export const createService = (payload) => {
    return api.post('/services/', payload)
}

export const updateService = (id, payload) => {
    return api.patch(`/services/${id}/`, payload)
}

export const deleteService = (id) => {
    return api.delete(`/services/${id}/`)
}

export const startService = (id) => {
    return api.post(`/services/${id}/start/`)
}