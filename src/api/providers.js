import api from "./axios";

export const getProviders = (params = {}) => {
    return api.get('/providers/', { params });
}

export const getProvider = (id) => {
    return api.get(`/providers/${id}/`);
}

export const createProvider = (data) => {
    return api.post(`/providers/`, data);
}

export const updateProvider = (id, data) => {
    return api.put(`/providers/${id}/`, data);
}

export const deleteProvider = (id)  => {
    return api.delete(`/providers/${id}/`);
}