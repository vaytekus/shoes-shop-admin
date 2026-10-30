import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrderById, updateOrderStatus } from '@/api/ordersApi'
import { getUserById } from '@/api/usersApi'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import type { OrderStatus } from '@/types'
import { toast } from 'sonner'

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Нове',
  Processing: 'В обробці',
  Shipped: 'Відправлено',
  Delivered: 'Доставлено',
  Cancelled: 'Скасовано',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Processing: 'bg-blue-100 text-blue-800 border-blue-200',
  Shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  Delivered: 'bg-green-100 text-green-800 border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border-red-200',
}

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

export default function OrderDetailPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const backTo = (location.state as { from?: string })?.from ?? '/orders'
  const backLabel = backTo.startsWith('/users') ? 'Назад до користувача' : 'Назад до списку'

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  })

  const order = data?.data

  const { data: userData } = useQuery({
    queryKey: ['user', order?.customerId],
    queryFn: () => getUserById(order!.customerId),
    enabled: !!order?.customerId,
  })

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      toast.success('Статус оновлено')
    },
  })

  if (isLoading) return <p className="text-muted-foreground">Завантаження...</p>
  if (!order) return <p className="text-muted-foreground">Замовлення не знайдено</p>

  const currentStatus = selectedStatus ?? order.status

  const user = userData?.data
  const customerName = user ? `${user.firstName} ${user.lastName}`.trim() || user.email : order.customerId

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate(backTo)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> {backLabel}
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Замовлення</h1>
          <p className="text-xs font-mono text-muted-foreground mt-0.5">{order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={currentStatus}
            onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
            disabled={mutation.isPending}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map(s => (
                <SelectItem key={s} value={s}>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_CLASS[s]}`}>
                    {STATUS_LABELS[s]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedStatus && selectedStatus !== order.status && (
            <Button size="sm" onClick={() => mutation.mutate(selectedStatus)} disabled={mutation.isPending}>
              Зберегти
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Покупець</p>
          <p className="text-sm font-medium">{customerName}</p>
          {user?.email && customerName !== user.email && (
            <p className="text-xs text-muted-foreground">{user.email}</p>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Дата</p>
          <p className="text-sm">{new Date(order.createdAt).toLocaleString('uk-UA')}</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Статус</p>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${STATUS_CLASS[order.status]}`}>
            {STATUS_LABELS[order.status]}
          </span>
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
