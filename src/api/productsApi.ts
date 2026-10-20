import client from './client'
import type { Product, PagedResult } from '@/types'

export const getProducts = (page = 1, pageSize = 20, categoryId?: string) => {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
  if (categoryId) params.append('categoryId', categoryId)
  return client.get<PagedResult<Product>>(`/products?${params}`)
}

export const getProductById = (id: string) =>
  client.get<Product>(`/products/${id}`)

export const deleteProduct = (id: string) =>
  client.delete(`/products/${id}`)

export const createVariant = (productId: string, data: { name: string; sku?: string; colorName?: string; colorHex?: string }) =>
  client.post<string>(`/products/${productId}/variants`, data)

export const updateVariant = (productId: string, variantId: string, data: { name: string; sku?: string; colorName?: string; colorHex?: string }) =>
  client.put(`/products/${productId}/variants/${variantId}`, data)

export const deleteVariant = (productId: string, variantId: string) =>
  client.delete(`/products/${productId}/variants/${variantId}`)

export const uploadImages = (productId: string, variantId: string, files: File[]) => {
  const formData = new FormData()
  files.forEach((f) => formData.append('files', f))
  return client.post<{ url: string[] }>(`/products/${productId}/variants/${variantId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const addSize = (productId: string, variantId: string, data: { size: string; stockQuantity: number }) =>
  client.post<string>(`/products/${productId}/variants/${variantId}/sizes`, data)

export const updateSize = (productId: string, variantId: string, sizeId: string, data: { size: string; stockQuantity: number }) =>
  client.put(`/products/${productId}/variants/${variantId}/sizes/${sizeId}`, data)

export const deleteSize = (productId: string, variantId: string, sizeId: string) =>
  client.delete(`/products/${productId}/variants/${variantId}/sizes/${sizeId}`)
