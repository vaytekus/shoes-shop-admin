import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { getOrders } from '@/api/ordersApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DateRangePicker from '@/components/ui/date-range-picker'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { OrderStatus } from '@/types'
import CustomerName from '@/components/orders/CustomerName'

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

const PAGE_SIZE = 20

export default function OrdersPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [range, setRange] = useState<DateRange | undefined>()

  const { data, isLoading } = useQuery({
    queryKey: ['orders-all'],
    queryFn: () => getOrders(1, 500),
  })

  const allOrders = data?.data.items ?? []

  const filtered = useMemo(() => {
    let items = allOrders
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(o => o.id.toLowerCase().includes(q))
    }
    if (status) {
      items = items.filter(o => o.status === status)
    }
    if (range?.from) {
      const from = startOfDay(range.from)
      const to = endOfDay(range.to ?? range.from)
      items = items.filter(o => isWithinInterval(new Date(o.createdAt), { start: from, end: to }))
    }
    return items
  }, [allOrders, search, status, range])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const resetFilters = () => {
    setSearch('')
    setStatus('')
    setRange(undefined)
    setPage(1)
  }

  const hasFilters = search || status || range

  const handleFilterChange = (fn: () => void) => {
    fn()
    setPage(1)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Замовлення</h1>
      <div className="flex flex-wrap gap-2 mb-5">
        {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([s, label]) => (
          <span key={s} className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_CLASS[s]}`}>
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук по ID..."
            value={search}
            onChange={e => handleFilterChange(() => setSearch(e.target.value))}
            className="pl-9"
          />
        </div>
        <Select value={status || 'all'} onValueChange={v => handleFilterChange(() => setStatus(v === 'all' ? '' : v))}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DateRangePicker value={range} onChange={r => handleFilterChange(() => setRange(r))} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1.5 text-muted-foreground">
            <X size={14} /> Скинути
          </Button>
        )}
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : paged.length === 0 ? (
        <p className="text-muted-foreground">Замовлень не знайдено</p>
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
              {paged.map(o => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/orders/${o.id}`)}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{o.id.slice(0, 8)}...</TableCell>
                  <TableCell className="text-sm"><CustomerName customerId={o.customerId} /></TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_CLASS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </TableCell>
                  <TableCell>{o.totalAmount.toLocaleString('uk-UA')} ₴</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString('uk-UA')}
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

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{filtered.length} замовлень</p>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
