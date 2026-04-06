import { defineStore } from "pinia";
import { ref, computed } from "vue";
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('authStore', () => {
    const user = ref(null);
    const loading = ref(false);

    const isAuthenticated = computed(() => !!user.value);
    const isProvider = computed(() => user.value.provider_profile)
    const isClient = computed(() => user.value.client_profile)

    const login = async(credentials) => {
        try {
            loading.value = true;

            await authService.login(credentials);
            const response = await authService.getMe();

            user.value = response.data
        } catch(error) {
            console.log('Erro ao logar' + error);
        } finally {
            loading.value = false
        }
    }

    const fetchUser = async() => {
        try {
            loading.value = true;

            const response = await authService.getMe();
            user.value = response.data;
        } catch(error) {
            console.log('Erro ao buscar usuário logado:' + error);
            user.value = null
        } finally {
            loading.value = false;
        }
    }

    const logout = () => {
        authService.logout();
        user.value = null
    }

    return {
        user,
        loading,
        isAuthenticated
    }
})