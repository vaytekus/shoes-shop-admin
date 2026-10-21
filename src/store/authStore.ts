import { create } from 'zustand'
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
    const firstName: string = payload.given_name ?? ''
    const lastName: string = payload.family_name ?? ''
    const name = [firstName, lastName].filter(Boolean).join(' ') || null
    return { email: payload.email ?? payload.sub, roles, name }
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  setToken: (token) => set({ token, user: parseJwt(token) }),
  logout: () => set({ token: null, user: null }),
}))
