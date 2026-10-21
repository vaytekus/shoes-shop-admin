import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { subDays, startOfDay, endOfDay, eachDayOfInterval, format, isWithinInterval } from 'date-fns'
import { uk } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { getProducts } from '@/api/productsApi'
import { getCategories } from '@/api/categoriesApi'
import { getOrders } from '@/api/ordersApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import DateRangePicker from '@/components/ui/date-range-picker'
import { Package, Tag, ShoppingBag, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import type { OrderStatus } from '@/types'

const DEFAULT_RANGE: DateRange = {
  from: subDays(new Date(), 6),
  to: new Date(),
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  Pending: 'Нові',
  Processing: 'В обробці',
  Shipped: 'Відправлені',
  Delivered: 'Доставлені',
  Cancelled: 'Скасовані',
}

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Pending: 'default',
  Processing: 'secondary',
  Shipped: 'secondary',
  Delivered: 'outline',
  Cancelled: 'destructive',
}

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange | undefined>(DEFAULT_RANGE)
  const { data: productsData } = useQuery({
    queryKey: ['products-count'],
    queryFn: () => getProducts(1, 1),
  })
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })
  const { data: ordersData } = useQuery({
    queryKey: ['orders-all'],
    queryFn: () => getOrders(1, 500),
  })

  const allOrders = ordersData?.data.items ?? []
  const totalProducts = productsData?.data.totalCount ?? 0
  const totalCategories = categoriesData?.data.length ?? 0

  const orders = useMemo(() => {
    if (!range?.from) return allOrders
    const from = startOfDay(range.from)
    const to = endOfDay(range.to ?? range.from)
    return allOrders.filter(o => isWithinInterval(new Date(o.createdAt), { start: from, end: to }))
  }, [allOrders, range])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const revenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0)
    const pending = orders.filter(o => o.status === 'Pending').length
    const byStatus = Object.entries(STATUS_LABELS).map(([status, label]) => ({
      status: status as OrderStatus,
      label,
      count: orders.filter(o => o.status === status).length,
    }))
    return { totalOrders, revenue, pending, byStatus }
  }, [orders])

  const chartData = useMemo(() => {
    const from = range?.from ?? subDays(new Date(), 6)
    const to = range?.to ?? range?.from ?? new Date()
    const days = eachDayOfInterval({ start: startOfDay(from), end: startOfDay(to) })
    const counts = days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      return {
        dayStr,
        label: format(day, days.length > 14 ? 'd MMM' : 'EEE d', { locale: uk }),
        count: orders.filter(o => o.createdAt.slice(0, 10) === dayStr).length,
      }
    })
    const max = Math.max(...counts.map(d => d.count), 1)
    return counts.map(d => ({ ...d, pct: Math.round((d.count / max) * 100) }))
  }, [orders, range])

  const recentOrders = useMemo(() =>
    [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [orders]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Дашборд</h1>
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Продукти</CardTitle>
            <Package size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalProducts}</p>
            <Link to="/products" className="text-xs text-muted-foreground hover:underline">Переглянути →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Категорії</CardTitle>
            <Tag size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCategories}</p>
            <Link to="/categories" className="text-xs text-muted-foreground hover:underline">Переглянути →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Замовлення</CardTitle>
            <ShoppingBag size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <Link to="/orders" className="text-xs text-muted-foreground hover:underline">Переглянути →</Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">Виручка</CardTitle>
            <TrendingUp size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.revenue.toLocaleString('uk-UA')} ₴</p>
            <p className="text-xs text-muted-foreground">з доставлених замовлень</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders last 7 days chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Замовлення за 7 днів</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {chartData.map(d => (
                <div key={d.dayStr} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{d.count || ''}</span>
                  <div className="w-full bg-muted rounded-t-sm" style={{ height: `${Math.max(d.pct, 4)}%` }}>
                    <div className="w-full h-full bg-primary rounded-t-sm opacity-80" />
                  </div>
                  <span className="text-[10px] text-muted-foreground text-center leading-tight">{d.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Orders by status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">За статусами</CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={13} />
              <span>{stats.pending} нових</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.byStatus.map(({ status, label, count }) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[status]} className="text-xs w-24 justify-center">{label}</Badge>
                </div>
                <div className="flex items-center gap-3 flex-1 mx-4">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: stats.totalOrders ? `${(count / stats.totalOrders) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium w-6 text-right">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Останні замовлення</CardTitle>
            <Link to="/orders" className="text-xs text-muted-foreground hover:underline">Всі →</Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={14} className="text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{order.id.slice(0, 8)}…</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={STATUS_VARIANT[order.status]} className="text-xs">
                      {STATUS_LABELS[order.status]}
                    </Badge>
                    <span className="text-sm font-medium">{order.totalAmount.toLocaleString('uk-UA')} ₴</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
