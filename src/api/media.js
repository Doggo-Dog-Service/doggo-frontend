import api from "./axios";

export const postImage = (formData) => {
    return api.post('/media/images/', formData)
} 

export const postDocument = (formData) => {
    return api.post('/media/documents/', formData)
}
