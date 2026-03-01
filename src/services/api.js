import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Adjunta el token en cada request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el token expira, refresca automáticamente
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refreshToken = useAuthStore.getState().refreshToken
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        )
        useAuthStore.getState().setTokens(data.access_token, data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────────
export const authApi = {
  register:      (data) => api.post('/auth/register', data),
  login:         (data) => api.post('/auth/login', data),
  logout:        ()     => api.post('/auth/logout'),
  me:            ()     => api.get('/auth/me'),
  updateProfile:   (data) => api.put('/auth/profile', data),
  forgotPassword:  (data) => api.post('/auth/forgot-password', data),
}

// ── Professionals ─────────────────────────────────────────────
export const profApi = {
  getAll:   (params) => api.get('/professionals', { params }),
  getOne:   (id)     => api.get(`/professionals/${id}`),
  create:   (data)   => api.post('/professionals/profile', data),
  update:   (data)   => api.put('/professionals/profile', data),
  getStats: ()       => api.get('/professionals/me/stats'),
  setAvail: (data)   => api.put('/professionals/availability', data),
}

// ── Bookings ──────────────────────────────────────────────────
export const bookingsApi = {
  getSlots:        (params) => api.get('/bookings/available-slots', { params }),
  create:          (data)   => api.post('/bookings', data),
  getMine:         (params) => api.get('/bookings/my', { params }),
  getProfessional: (params) => api.get('/bookings/professional', { params }),
  cancel:          (id)     => api.patch(`/bookings/${id}/cancel`),
  review:          (id, data) => api.post(`/bookings/${id}/review`, data),
}

export default api