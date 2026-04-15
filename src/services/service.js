import * as serviceApi from '@/api/services'

export const getTypeServices = async (params) => {
    try {
        const { data } = await serviceApi.getServiceTypes(params)
        return data
    } catch (error) {
        throw error
    }
}