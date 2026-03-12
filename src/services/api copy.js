import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
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
  refresh:       (rt)   => api.post('/auth/refresh', { refresh_token: rt }),
  forgotPassword:(email)=> api.post('/auth/forgot-password', { email }),
  updateProfile: (data) => api.put('/auth/profile', data),
  oauthGoogle:   (access_token, refresh_token, role) =>
    api.post('/auth/oauth', { access_token, refresh_token, role }),
}

// ── Professionals ─────────────────────────────────────────────
export const profApi = {
  getAll:    (params) => api.get('/professionals', { params }),
  getOne:    (id)     => api.get(`/professionals/${id}`),
  create:    (data)   => api.post('/professionals/profile', data),
  update:    (data)   => api.put('/professionals/profile', data),
  getStats:      ()     => api.get('/professionals/me/stats'),
  getMyProfile:  ()     => api.get('/professionals/me/stats'),
  setAvail:  (data)   => api.put('/professionals/availability', data),
  uploadGalleryImage: (base64, caption) => api.post('/professionals/gallery/upload', { image: base64, caption }),
  deleteGalleryImage: (url)              => api.delete('/professionals/gallery/image', { data: { url } }),
}

// ── Bookings ──────────────────────────────────────────────────
export const bookingsApi = {
  getSlots:         (params)    => api.get('/bookings/available-slots', { params }),
  create:           (data)      => api.post('/bookings', data),
  getMine:          ()          => api.get('/bookings/my'),
  getPro:           ()          => api.get('/bookings/professional'),
  cancel:           (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),
  complete:         (id)        => api.patch(`/bookings/${id}/complete`),
  review:           (id, data)  => api.post(`/bookings/${id}/review`, data),
  reschedule:       (id, starts_at) => api.patch(`/bookings/${id}/reschedule`, { starts_at }),
  addNote:          (id, note)  => api.patch(`/bookings/${id}/note`, { note }),
}

// ── Storage (Supabase direct) ─────────────────────────────────
export const storageApi = {
  uploadAvatar: async (file, userId) => {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    )
    const ext  = file.name.split('.').pop()
    const path = `avatars/${userId}.${ext}`
    const { error } = await supabase.storage
      .from('topsy-public')
      .upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('topsy-public').getPublicUrl(path)
    return data.publicUrl
  },
}

export default api
