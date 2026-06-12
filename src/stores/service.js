import * as serviceService from '@/services/service'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServiceStore = defineStore('serviceStore', () => {
  const loading = ref(false)
  const typeServices = ref([])
  const services = ref([])

  const getTypeServices = async (params) => {
    try {
      loading.value = true
      const response = await serviceService.getTypeServices(params)
      typeServices.value = response.results
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const getServices = async (params) => {
    try {
      loading.value = true
      const response = await serviceService.getServices(params)
      services.value = response.results
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const postService = async (data) => {
    try {
      loading.value = true
      const response = await serviceService.postService(data)
      return response
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  const updateService = async (data) => {
    try {
      loading.value = true
      const response = serviceService.updateService(data)
      return response
    } catch (error) {
      console.log(error)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    typeServices,
    getTypeServices,
    getServices,
    postService,
    updateService
  }
})
