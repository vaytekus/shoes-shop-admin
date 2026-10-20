import client from './client'
import type { LoginRequest, LoginResponse } from '@/types'

export const login = (data: LoginRequest) =>
  client.post<LoginResponse>('/users/login', data)
