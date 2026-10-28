import axios from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, clearTokens } from "@/utils/token";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/'
});

let unauthorizedHandler = null
let refreshPromise = null

export const setUnauthorizedHandler = (fn) => {
    unauthorizedHandler = fn
}

const isAuthUrl = (url = '') => /\/token\/(refresh\/)?$/.test(url)

const refreshAccessToken = () => {
    if (!refreshPromise) {
        const refresh = getRefreshToken()
        refreshPromise = (refresh
            ? api.post('/token/refresh/', { refresh })
            : Promise.reject(new Error('Sem refresh token'))
        )
            .then(({ data }) => {
                setAccessToken(data.access)
                return data.access
            })
            .finally(() => {
                refreshPromise = null
            })
    }
    return refreshPromise
}

api.interceptors.request.use((config) => {
    const token = getAccessToken()

    if(token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config

        if (error.response?.status !== 401 || !original || original._retry || isAuthUrl(original.url)) {
            return Promise.reject(error)
        }

        original._retry = true

        try {
            const access = await refreshAccessToken()
            original.headers.Authorization = `Bearer ${access}`
            return api(original)
        } catch {
            clearTokens()
            unauthorizedHandler?.()
            return Promise.reject(error)
        }
    }
);

export default api
