import api from './axios'

export const getServiceTypes = (params) => {
  return api.get('/type-services/', { params })
}

export const getServices = (params) => {
  return api.get('/services/', { params })
}

export const postService = (data) => {
  return api.post('/services/', data)
}

export const updateService = (data) => {
  return api.patch('/service/', data)
}
