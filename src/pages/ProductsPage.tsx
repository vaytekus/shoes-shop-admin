import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '@/api/productsApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Pencil } from 'lucide-react'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['products', page],
    queryFn: () => getProducts(page, 20),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const products = data?.data.items ?? []
  const total = data?.data.totalCount ?? 0
  const pageCount = Math.ceil(total / 20)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Продукти</h1>
        <Button asChild size="sm">
          <Link to="/products/create">
            <Plus size={16} className="mr-1" />
            Додати
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Назва</TableHead>
                <TableHead>Бренд</TableHead>
                <TableHead>Категорія</TableHead>
                <TableHead>Ціна</TableHead>
                <TableHead>Знижка</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.brand ?? '—'}</TableCell>
                  <TableCell>{p.categoryName ?? '—'}</TableCell>
                  <TableCell>${p.price}</TableCell>
                  <TableCell>
                    {p.discountPercent ? (
                      <Badge variant="destructive">-{p.discountPercent}%</Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/products/${p.id}/edit`}>
                          <Pencil size={15} />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm(`Видалити "${p.name}"?`)) deleteMutation.mutate(p.id)
                        }}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pageCount > 1 && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                Назад
              </Button>
              <span className="text-sm text-muted-foreground flex items-center">
                {page} / {pageCount}
              </span>
              <Button variant="outline" size="sm" disabled={page === pageCount} onClick={() => setPage(p => p + 1)}>
                Далі
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
