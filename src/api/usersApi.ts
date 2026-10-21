import client from './client'

export interface KeycloakUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  emailVerified: boolean
  enabled: boolean
  createdTimestamp: number
}

export interface UsersResponse {
  items: KeycloakUser[]
  totalCount: number
  page: number
  pageSize: number
}

export const getUsers = (page = 1, pageSize = 20, search?: string) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (search) params.set('search', search)
  return client.get<UsersResponse>(`/users?${params}`)
}

export interface CreateUserRequest {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const createUser = (data: CreateUserRequest) =>
  client.post('/users/register', data)
