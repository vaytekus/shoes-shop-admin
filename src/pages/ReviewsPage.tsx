import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Trash2 } from 'lucide-react'
import { getReviews, approveReview, rejectReview, deleteReview } from '@/api/reviewsApi'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { ReviewStatus } from '@/types'

const STATUS_LABELS: Record<ReviewStatus, string> = {
  Pending: 'Очікує',
  Approved: 'Схвалено',
  Rejected: 'Відхилено',
}

const STATUS_CLASS: Record<ReviewStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
  Approved: 'bg-green-100 text-green-800 border border-green-200',
  Rejected: 'bg-red-100 text-red-800 border border-red-200',
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ReviewsPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ReviewStatus | 'all'>('all')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', status],
    queryFn: () => getReviews(status === 'all' ? undefined : status).then(r => r.data),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })

  const { mutate: approve } = useMutation({ mutationFn: approveReview, onSuccess: invalidate })
  const { mutate: reject } = useMutation({ mutationFn: rejectReview, onSuccess: invalidate })
  const { mutate: remove } = useMutation({ mutationFn: deleteReview, onSuccess: invalidate })

  const reviews = data ?? []

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Відгуки</h1>

      <div className="flex gap-3 mb-5">
        <Select value={status} onValueChange={v => setStatus(v as ReviewStatus | 'all')}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі статуси</SelectItem>
            {(Object.entries(STATUS_LABELS) as [ReviewStatus, string][]).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">Відгуків не знайдено</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Продукт</TableHead>
              <TableHead>Покупець</TableHead>
              <TableHead>Оцінка</TableHead>
              <TableHead>Текст</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map(r => (
              <TableRow key={r.id}>
                <TableCell className="text-sm font-medium max-w-[160px] truncate">{r.productName}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.customerName}</TableCell>
                <TableCell><Stars rating={r.rating} /></TableCell>
                <TableCell className="text-sm max-w-[240px]">
                  <span className="line-clamp-2">{r.text}</span>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_CLASS[r.status]}`}>
                    {STATUS_LABELS[r.status]}
                  </span>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.createdAt).toLocaleDateString('uk-UA')}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {r.status !== 'Approved' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => approve(r.id)}>
                        <Check size={15} />
                      </Button>
                    )}
                    {r.status !== 'Rejected' && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700" onClick={() => reject(r.id)}>
                        <X size={15} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => remove(r.id)}>
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
