import api from './axios'

export const getPets = (params = {}) => {
  return api.get('/pets/', { params })
}

export const getPet = (id) => {
  return api.get(`/pets/${id}/`)
}

export const updatePet = (id, data) => {
  return api.patch(`/pets/${id}/`, data)
}

export const deletePet = (id) => {
  return api.delete(`/pets/${id}/`)
}