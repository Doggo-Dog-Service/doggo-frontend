import api from "./axios";

export const getServiceTypes = (params) => {
    return api.get('/type-services/', { params });
}