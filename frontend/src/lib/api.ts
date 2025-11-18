import axios from 'axios'

// Use local API routes (same app, no need for full URL)
const API_URL = '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for auth tokens (future use)
api.interceptors.request.use(
  (config) => {
    // Add auth token here when implemented
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access')
    }
    return Promise.reject(error)
  }
)

export default api
