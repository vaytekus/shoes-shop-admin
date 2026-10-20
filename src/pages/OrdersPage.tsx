import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getOrders } from '@/api/ordersApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { OrderStatus } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Нове',
  Processing: 'В обробці',
  Shipped: 'Відправлено',
  Delivered: 'Доставлено',
  Cancelled: 'Скасовано',
}

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Pending: 'outline',
  Processing: 'secondary',
  Shipped: 'default',
  Delivered: 'default',
  Cancelled: 'destructive',
}

export default function OrdersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const pageSize = 20

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => getOrders(page, pageSize),
  })

  const orders = data?.data.items ?? []
  const totalCount = data?.data.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Замовлення</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground">Замовлень немає</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Покупець</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Сума</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/orders/${o.id}`)}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}...</TableCell>
                  <TableCell className="text-sm">{o.customerId.slice(0, 12)}...</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                  </TableCell>
                  <TableCell>{o.totalAmount.toLocaleString('uk-UA')} ₴</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString('uk-UA')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); navigate(`/orders/${o.id}`) }}>
                      Деталі
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center gap-3 mt-4 justify-end">
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
    </div>
  )
}
