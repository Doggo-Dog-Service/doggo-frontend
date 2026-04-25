import api from "./axios";

export const globalSearchRequest = (query) => {
    return api.get('/search/', { params: { q: query } })
} 