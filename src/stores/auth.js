import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(JSON.parse(localStorage.getItem('auth_user') || 'null'))
    const loading = ref(false)
    const error = ref(null)

    // Getters
    const isAuthenticated = computed(() => !!user.value)
    const userName = computed(() => user.value?.name || '')
    const userEmail = computed(() => user.value?.email || '')

    // Actions
    async function register(userData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/register', userData)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function login(credentials) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/login', credentials)

            if (response.data.success) {
                user.value = response.data.user
                localStorage.setItem('auth_user', JSON.stringify(response.data.user))
            }

            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function logout() {
        loading.value = true

        try {
            await api.post('/logout')
        } catch (err) {
            // Ignore logout errors
        } finally {
            user.value = null
            localStorage.removeItem('auth_user')
            loading.value = false
        }
    }

    async function fetchUser() {
        try {
            const response = await api.get('/user')
            user.value = response.data.user
            localStorage.setItem('auth_user', JSON.stringify(response.data.user))
            return response.data.user
        } catch (err) {
            user.value = null
            localStorage.removeItem('auth_user')
            return null
        }
    }

    async function forgotPassword(email) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/forgot-password', { email })
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function resetPassword(data) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/reset-password', data)
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    function clearError() {
        error.value = null
    }

    async function verifyEmail(id, hash, expires, signature) {
        loading.value = true
        error.value = null

        try {
            const response = await api.get(`/email/verify/${id}/${hash}`, {
                params: { expires, signature }
            })
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function resendVerification(email) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/email/resend-verification', { email })
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งอีเมล'
            throw err
        } finally {
            loading.value = false
        }
    }

    function hasPermission(permissionName) {
        if (!user.value || !user.value.permissions) return false
        return user.value.permissions.includes(permissionName)
    }

    return {
        // State
        user,
        loading,
        error,
        // Getters
        isAuthenticated,
        userName,
        userEmail,
        // Actions
        register,
        login,
        logout,
        fetchUser,
        forgotPassword,
        resetPassword,
        clearError,
        verifyEmail,
        resendVerification,
        hasPermission
    }
})
