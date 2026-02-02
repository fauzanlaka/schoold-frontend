import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export const useSchoolStore = defineStore('school', () => {
    // State
    const school = ref(null)
    const loading = ref(false)
    const error = ref(null)
    const hasSchool = ref(null)

    // Location data
    const provinces = ref([])
    const amphures = ref([])
    const subdistricts = ref([])
    const gradeLevels = ref([])

    // Getters
    const isRegistered = computed(() => hasSchool.value === true)
    const schoolName = computed(() => school.value?.school_name || '')

    // Actions
    async function checkRegistration() {
        loading.value = true
        error.value = null

        try {
            const response = await api.get('/school/check')
            hasSchool.value = response.data.has_school
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function fetchSchool() {
        loading.value = true
        error.value = null

        try {
            const response = await api.get('/school')
            if (response.data.success) {
                school.value = response.data.school
                hasSchool.value = true
            }
            return response.data
        } catch (err) {
            if (err.response?.status === 404) {
                hasSchool.value = false
            }
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาด'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function registerSchool(schoolData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.post('/school', schoolData)
            if (response.data.success) {
                school.value = response.data.school
                hasSchool.value = true
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function updateSchool(schoolData) {
        loading.value = true
        error.value = null

        try {
            const response = await api.put('/school', schoolData)
            if (response.data.success) {
                school.value = response.data.school
            }
            return response.data
        } catch (err) {
            error.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดต'
            throw err
        } finally {
            loading.value = false
        }
    }

    // Location actions
    async function fetchProvinces() {
        try {
            const response = await api.get('/locations/provinces')
            if (response.data.success) {
                provinces.value = response.data.provinces
            }
            return response.data.provinces
        } catch (err) {
            console.error('Error fetching provinces:', err)
            return []
        }
    }

    async function fetchAmphures(provinceId) {
        try {
            amphures.value = []
            subdistricts.value = []
            const response = await api.get(`/locations/amphures/${provinceId}`)
            if (response.data.success) {
                amphures.value = response.data.amphures
            }
            return response.data.amphures
        } catch (err) {
            console.error('Error fetching amphures:', err)
            return []
        }
    }

    async function fetchSubdistricts(amphureId) {
        try {
            subdistricts.value = []
            const response = await api.get(`/locations/subdistricts/${amphureId}`)
            if (response.data.success) {
                subdistricts.value = response.data.subdistricts
            }
            return response.data.subdistricts
        } catch (err) {
            console.error('Error fetching subdistricts:', err)
            return []
        }
    }

    async function fetchGradeLevels() {
        try {
            const response = await api.get('/grade-levels')
            if (response.data.success) {
                gradeLevels.value = response.data.grade_levels
            }
            return response.data.grade_levels
        } catch (err) {
            console.error('Error fetching grade levels:', err)
            return []
        }
    }

    function clearError() {
        error.value = null
    }

    function reset() {
        school.value = null
        hasSchool.value = null
        provinces.value = []
        amphures.value = []
        subdistricts.value = []
        gradeLevels.value = []
    }

    return {
        // State
        school,
        loading,
        error,
        hasSchool,
        provinces,
        amphures,
        subdistricts,
        gradeLevels,
        // Getters
        isRegistered,
        schoolName,
        // Actions
        checkRegistration,
        fetchSchool,
        registerSchool,
        updateSchool,
        fetchProvinces,
        fetchAmphures,
        fetchSubdistricts,
        fetchGradeLevels,
        clearError,
        reset
    }
})
