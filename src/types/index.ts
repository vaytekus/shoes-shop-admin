export interface Category {
  id: string
  name: string
  slug: string
}

export interface ProductSize {
  id: string
  size: string
  stockQuantity: number
}

export interface ProductVariant {
  id: string
  name: string
  sku: string | null
  colorName: string | null
  colorHex: string | null
  imageUrls: string[]
  sizes: ProductSize[]
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  brand: string | null
  gender: string | null
  discountPercent: number | null
  categoryId: string | null
  categoryName: string | null
  variants: ProductVariant[]
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
}

export interface AuthUser {
  email: string
  roles: string[]
}
