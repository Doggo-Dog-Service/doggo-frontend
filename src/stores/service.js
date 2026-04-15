import * as serviceService from '@/services/service'
import { defineStore } from "pinia";
import { ref } from 'vue';

export const useServiceStore = defineStore('serviceStore', () => {
    
    const loading = ref(false)
    const typeServices = ref([]);

    const getServices = async (params) => {
        try {
            loading.value = true
            const response = await serviceService.getTypeServices(params)
            typeServices.value = response.results
        } catch(error) {
            console.log(error)
        } finally {
            loading.value = false
        }
    }

    return {
        loading,
        typeServices,
        getServices
    }
})