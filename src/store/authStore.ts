import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser } from '@/types'

interface AuthState {
  token: string | null
  user: AuthUser | null
  setToken: (token: string) => void
  logout: () => void
}

function parseJwt(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const roles: string[] = payload.realm_access?.roles ?? []
    return { email: payload.email ?? payload.sub, roles }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token, user: parseJwt(token) }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'admin-auth' }
  )
)
