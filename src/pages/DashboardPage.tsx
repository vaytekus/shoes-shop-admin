import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'
import { getProducts } from '@/api/productsApi'
import { getCategories } from '@/api/categoriesApi'

export default function DashboardPage() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => getProducts(1, 1),
  })
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Дашборд</h1>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Продуктів</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{products?.data.totalCount ?? '—'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Категорій</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{categories?.data.length ?? '—'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
