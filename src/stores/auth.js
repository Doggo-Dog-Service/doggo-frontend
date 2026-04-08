import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useToast } from "vue-toast-notification";
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('authStore', () => {

    const $toast = useToast();

    const user = ref(null);
    const loading = ref(false);

    const isAuthenticated = computed(() => !!user.value);
    const isProvider = computed(() => user.value.provider_profile);
    const isClient = computed(() => user.value.client_profile);

    const login = async(credentials) => {
        try {
            loading.value = true;

            await authService.login(credentials);
            user.value = await authService.getMe();
        } catch(error) {
            $toast.error(error.message, {
                type: 'error',
                duration: 3000,
                position: 'top-right'
            })
        } finally {
            loading.value = false
        }
    }

    const fetchUser = async() => {
        try {
            loading.value = true;
            user.value = await authService.getMe();
        } catch(error) {
            $toast.error(error.message, {
                type: 'error',
                duration: 3000,
                position: 'top-right'
            })
            user.value = null;
        } finally {
            loading.value = false;
        }
    }

    const logout = () => {
        authService.logout();
        user.value = null;
        $toast.error('Logout realizado!', {
            type: 'error',
            duration: 3000,
            position: 'top-right'
        })
    }

    return {
        user,
        loading,
        isAuthenticated,
        isClient,
        isProvider,
        login,
        fetchUser,
        logout,
    }
})