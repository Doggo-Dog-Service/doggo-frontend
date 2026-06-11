import api from "./axios";

export const postImage = (formData) => {
    return api.post('/media/images/', formData)
} 