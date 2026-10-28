import api from './axios'

export const getAvailabilitySlots = (params = {}) => {
  return api.get('/availability/slots/', { params })
}

export const listAvailability = (params = {}) => {
  return api.get('/availability/', { params })
}

export const createAvailability = (payload) => {
  return api.post('/availability/', payload)
}

export const deleteAvailability = (id) => {
  return api.delete(`/availability/${id}/`)
}
