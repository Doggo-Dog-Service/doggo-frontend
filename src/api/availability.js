import api from './axios'

export const getAvailabilitySlots = (params = {}) => {
  return api.get('/availability/slots/', { params })
}
