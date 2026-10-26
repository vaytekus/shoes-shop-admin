import client from './client'
import type { Order, OrderStatus, PagedResult } from '@/types'

export const getOrders = (page = 1, pageSize = 20) =>
  client.get<PagedResult<Order>>(`/orders?page=${page}&pageSize=${pageSize}`)

export const getOrderById = (id: string) =>
  client.get<Order>(`/orders/${id}`)

export const updateOrderStatus = (id: string, status: OrderStatus) =>
  client.put(`/orders/${id}/status`, { status })

export const getCustomerOrders = (customerId: string, page = 1, pageSize = 10) =>
  client.get<PagedResult<Order>>(`/orders/customer/${customerId}?page=${page}&pageSize=${pageSize}`)
