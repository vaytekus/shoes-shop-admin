export interface Category {
  id: string
  name: string
  slug: string
  section: string | null
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
  sku: string | null
  section: string | null
  discountPercent: number | null
  isNew: boolean
  categoryId: string | null
  categoryName: string | null
  upperMaterial: string | null
  liningMaterial: string | null
  insoleMaterial: string | null
  soleMaterial: string | null
  width: string | null
  season: string | null
  heelHeight: string | null
  purpose: string | null
  style: string | null
  brandCountry: string | null
  manufactureCountry: string | null
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
  name: string | null
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'

export interface ShippingAddress {
  street: string
  city: string
  country: string
  zipCode: string
}

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  imageUrl: string
}

export interface Order {
  id: string
  customerId: string
  status: OrderStatus
  totalAmount: number
  createdAt: string
  shippingAddress: ShippingAddress
  items: OrderItem[]
}
