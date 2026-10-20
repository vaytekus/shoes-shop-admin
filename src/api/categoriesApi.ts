import client from './client'
import type { Category } from '@/types'

export const getCategories = () =>
  client.get<Category[]>('/categories')

export const createCategory = (data: { name: string; slug: string }) =>
  client.post<Category>('/categories', data)

export const updateCategory = (id: string, name: string) =>
  client.put(`/categories/${id}`, { name })

export const deleteCategory = (id: string) =>
  client.delete(`/categories/${id}`)
