import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:         null,
      token:        null,
      refreshToken: null,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      setTokens: (token, refreshToken) =>
        set({ token, refreshToken }),

      setUser: (user) => set({ user }),

      updatePoints: (points) =>
        set((s) => ({ user: s.user ? { ...s.user, points } : s.user })),

      logout: () => set({ user: null, token: null, refreshToken: null }),

      isAuthenticated: () => !!get().token,
      isProfessional:  () => get().user?.role === 'professional',
      isAdmin:         () => get().user?.role === 'admin',
    }),
    {
      name: 'topsy-auth',
      partialize: (s) => ({
        user:         s.user,
        token:        s.token,
        refreshToken: s.refreshToken,
      }),
    }
  )
)