import axios from 'axios'

// Get API URLs from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/school-management-system/backend/public/api'
const SANCTUM_URL = import.meta.env.VITE_SANCTUM_URL || 'http://localhost/school-management-system/backend/public/sanctum'

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

// Function to get CSRF cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        return decodeURIComponent(parts.pop().split(';').shift())
    }
    return null
}

// Variable to track if CSRF cookie has been fetched
let csrfInitialized = false

// Function to initialize CSRF
async function initializeCsrf() {
    if (!csrfInitialized) {
        await axios.get(`${SANCTUM_URL}/csrf-cookie`, {
            withCredentials: true
        })
        csrfInitialized = true
    }
}

// Add request interceptor to set CSRF token
api.interceptors.request.use(async (config) => {
    // For mutating requests, ensure CSRF is initialized
    if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
        await initializeCsrf()

        // Get XSRF token from cookie and set header
        const token = getCookie('XSRF-TOKEN')
        if (token) {
            config.headers['X-XSRF-TOKEN'] = token
        }
    }
    return config
})

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle CSRF token mismatch - retry once after refreshing token
        if (error.response?.status === 419 && !originalRequest._retry) {
            originalRequest._retry = true
            csrfInitialized = false

            // Re-fetch CSRF cookie
            await axios.get(`${SANCTUM_URL}/csrf-cookie`, {
                withCredentials: true
            })
            csrfInitialized = true

            // Update the token in the original request
            const newToken = getCookie('XSRF-TOKEN')
            if (newToken) {
                originalRequest.headers['X-XSRF-TOKEN'] = newToken
            }

            // Retry the original request
            return api(originalRequest)
        }

        if (error.response?.status === 401) {
            // Only redirect to login if not already on auth pages
            const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
            const currentPath = window.location.pathname
            const isAuthPage = authPages.some(page => currentPath.includes(page))

            if (!isAuthPage) {
                localStorage.removeItem('auth_user')
                // window.location.href = '/login'
                router.push('/login')
            }
        }
        return Promise.reject(error)
    }
)

export default api
