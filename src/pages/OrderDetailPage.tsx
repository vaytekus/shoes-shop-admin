import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrderById, updateOrderStatus } from '@/api/ordersApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import type { OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Нове',
  Processing: 'В обробці',
  Shipped: 'Відправлено',
  Delivered: 'Доставлено',
  Cancelled: 'Скасовано',
}

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  })

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id!, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['order', id] }),
  })

  if (isLoading) return <p className="text-muted-foreground">Завантаження...</p>

  const order = data?.data
  if (!order) return <p className="text-muted-foreground">Замовлення не знайдено</p>

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Назад до списку
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Замовлення</h1>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{order.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={order.status}
            onValueChange={(v) => mutation.mutate(v as OrderStatus)}
            disabled={mutation.isPending}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map(s => (
                <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Покупець</p>
          <p className="text-sm font-mono">{order.customerId}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Дата</p>
          <p className="text-sm">{new Date(order.createdAt).toLocaleString('uk-UA')}</p>
        </div>
        <div className="space-y-1 col-span-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Адреса доставки</p>
          <p className="text-sm">
            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.zipCode}, {order.shippingAddress.country}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Товари</h2>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
            {item.imageUrl && (
              <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 object-cover rounded-md shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.productName}</p>
              <p className="text-xs text-muted-foreground">{item.quantity} шт. × {item.price.toLocaleString('uk-UA')} ₴</p>
            </div>
            <p className="text-sm font-medium shrink-0">{(item.quantity * item.price).toLocaleString('uk-UA')} ₴</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Всього</p>
          <p className="text-2xl font-semibold">{order.totalAmount.toLocaleString('uk-UA')} ₴</p>
        </div>
      </div>
    </div>
  )
}
