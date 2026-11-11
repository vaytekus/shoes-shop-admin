import client from './client'
import type { AdminReview, ReviewStatus } from '@/types'

export const getReviews = (status?: ReviewStatus) =>
  client.get<AdminReview[]>('/reviews', { params: status ? { status } : undefined })

export const approveReview = (id: string) =>
  client.put(`/reviews/${id}/approve`)

export const rejectReview = (id: string) =>
  client.put(`/reviews/${id}/reject`)

export const deleteReview = (id: string) =>
  client.delete(`/reviews/${id}`)
