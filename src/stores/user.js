import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useUserStore = defineStore('user', () => {
    // State
    const users = ref([])
    const roles = ref([])
    const permissions = ref({})
    const loading = ref(false)
    const error = ref(null)
    const pagination = ref({
        current_page: 1,
        last_page: 1,
        total: 0
    })

    // Getters
    const totalUsers = computed(() => pagination.value.total)

    // User Actions
    async function fetchUsers(params = {}) {
        loading.value = true
        error.value = null

        try {
            const response = await api.get('/users', { params })
            if (response.data.success) {
                users.value = response.data.data.data
                pagination.value = {
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    total: response.data.data.total
                }
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createUser(userData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/users', userData)
            if (response.data.success) {
                users.value.unshift(response.data.data)
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateUser(userId, userData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.put(`/users/${userId}`, userData)
            if (response.data.success) {
                const index = users.value.findIndex(u => u.id === userId)
                if (index !== -1) {
                    users.value[index] = response.data.data
                }
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteUser(userId) {
        loading.value = true
        error.value = null

        try {
            const response = await api.delete(`/users/${userId}`)
            if (response.data.success) {
                users.value = users.value.filter(u => u.id !== userId)
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Role Actions
    async function fetchRoles() {
        try {
            const response = await api.get('/roles')
            if (response.data.success) {
                roles.value = response.data.data
            }
            return response.data
        } catch (err) {
            console.error('Error fetching roles:', err)
            throw err
        }
    }

    async function fetchAvailableRoles() {
        try {
            const response = await api.get('/users/available-roles')
            if (response.data.success) {
                roles.value = response.data.data
            }
            return response.data.data
        } catch (err) {
            console.error('Error fetching available roles:', err)
            return []
        }
    }

    async function createRole(roleData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/roles', roleData)
            if (response.data.success) {
                roles.value.push(response.data.data)
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateRole(roleId, roleData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.put(`/roles/${roleId}`, roleData)
            if (response.data.success) {
                const index = roles.value.findIndex(r => r.id === roleId)
                if (index !== -1) {
                    roles.value[index] = response.data.data
                }
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteRole(roleId) {
        loading.value = true
        error.value = null

        try {
            const response = await api.delete(`/roles/${roleId}`)
            if (response.data.success) {
                roles.value = roles.value.filter(r => r.id !== roleId)
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Permission Actions
    async function fetchPermissions() {
        try {
            const response = await api.get('/permissions')
            if (response.data.success) {
                permissions.value = response.data.data
            }
            return response.data.data
        } catch (err) {
            console.error('Error fetching permissions:', err)
            return {}
        }
    }

    function clearError() {
        error.value = null
    }

    function reset() {
        users.value = []
        roles.value = []
        permissions.value = {}
        pagination.value = { current_page: 1, last_page: 1, total: 0 }
    }

    return {
        // State
        users,
        roles,
        permissions,
        loading,
        error,
        pagination,
        // Getters
        totalUsers,
        // User Actions
        fetchUsers,
        createUser,
        updateUser,
        deleteUser,
        // Role Actions
        fetchRoles,
        fetchAvailableRoles,
        createRole,
        updateRole,
        deleteRole,
        // Permission Actions
        fetchPermissions,
        // Helpers
        clearError,
        reset
    }
})
