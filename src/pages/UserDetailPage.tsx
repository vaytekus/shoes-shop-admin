import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getUserById } from '@/api/usersApi'
import { getCustomerOrders } from '@/api/ordersApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, ArrowLeft, Mail, Calendar, ShieldCheck } from 'lucide-react'
import type { OrderStatus } from '@/types'

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Нове',
  Processing: 'В обробці',
  Shipped: 'Відправлено',
  Delivered: 'Доставлено',
  Cancelled: 'Скасовано',
}

const STATUS_CLASS: Record<OrderStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Processing: 'bg-blue-100 text-blue-800 border border-blue-200',
  Shipped: 'bg-purple-100 text-purple-800 border border-purple-200',
  Delivered: 'bg-green-100 text-green-800 border border-green-200',
  Cancelled: 'bg-red-100 text-red-800 border border-red-200',
}

const PAGE_SIZE = 10

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [page, setPage] = useState(1)

  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id!),
    enabled: !!id,
  })

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', id, page],
    queryFn: () => getCustomerOrders(id!, page, PAGE_SIZE),
    enabled: !!id,
  })

  const user = userData?.data
  const orders = ordersData?.data.items ?? []
  const totalCount = ordersData?.data.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  if (userLoading) return <p className="text-muted-foreground">Завантаження...</p>
  if (!user) return <p className="text-muted-foreground">Користувача не знайдено</p>

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—'

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/users')}>
          <ArrowLeft size={16} />
        </Button>
        <h1 className="text-2xl font-semibold">{fullName}</h1>
      </div>

      {/* User info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Інформація</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={14} className="text-muted-foreground" />
            <span>{user.email}</span>
            <Badge variant={user.emailVerified ? 'outline' : 'secondary'} className="text-xs ml-1">
              {user.emailVerified ? 'підтверджено' : 'не підтверджено'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-muted-foreground" />
            <span>Зареєстрований {new Date(user.createdTimestamp).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheck size={14} className="text-muted-foreground" />
            <Badge variant={user.enabled ? 'default' : 'destructive'} className="text-xs">
              {user.enabled ? 'Активний' : 'Заблокований'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Замовлення</CardTitle>
          <span className="text-sm text-muted-foreground">{totalCount} всього</span>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <p className="text-muted-foreground p-6">Завантаження...</p>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground p-6">Замовлень немає</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Сума</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(o => (
                    <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/orders/${o.id}`, { state: { from: `/users/${id}` } })}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}...</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_CLASS[o.status]}`}>
                          {STATUS_LABELS[o.status]}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{o.totalAmount.toLocaleString('uk-UA')} ₴</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString('uk-UA')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-3 p-4">
                  <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                  <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    <ChevronRight size={16} />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
