import * as serviceApi from '@/api/serviceType'

export const getTypeServices = async (params) => {
    try {
        const { data } = await serviceApi.getServiceTypes(params)
        return data
    } catch (error) {
        throw error
    }
}