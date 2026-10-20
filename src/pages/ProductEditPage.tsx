import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCategories } from '@/api/categoriesApi'
import { getProductById, createVariant, updateVariant } from '@/api/productsApi'
import client from '@/api/client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import VariantFormRemote, { type VariantFields } from '@/components/products/VariantFormRemote'
import FixedBar from '@/components/layout/FixedBar'
import { Plus } from 'lucide-react'

const GENDER_OPTIONS = [
  { value: 'men', label: 'Чоловіче' },
  { value: 'women', label: 'Жіноче' },
  { value: 'kids', label: 'Дитяче' },
  { value: 'bags', label: 'Сумки' },
  { value: 'accessories', label: 'Аксесуари' },
]

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  })

  const categories = categoriesData?.data ?? []
  const product = productData?.data

  const [form, setForm] = useState({
    name: '', description: '', price: '', brand: '',
    gender: '', discountPercent: '', categoryId: '',
  })
  const [variantChanges, setVariantChanges] = useState<Record<string, VariantFields>>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!product) return
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      brand: product.brand ?? '',
      gender: product.gender ?? '',
      discountPercent: product.discountPercent != null ? String(product.discountPercent) : '',
      categoryId: product.categoryId ?? '',
    })
  }, [product])

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['product', id] })

  const handleFieldsChange = useCallback((variantId: string, fields: VariantFields) => {
    setVariantChanges(prev => ({ ...prev, [variantId]: fields }))
  }, [])

  const handleSave = async () => {
    setError('')
    setLoading(true)
    try {
      await client.put(`/products/${id}`, {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        brand: form.brand || null,
        gender: form.gender || null,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
        categoryId: form.categoryId || null,
      })

      await Promise.all(
        Object.entries(variantChanges).map(([variantId, fields]) =>
          updateVariant(id!, variantId, {
            name: fields.name,
            sku: fields.sku || undefined,
            colorName: fields.colorName || undefined,
            colorHex: fields.colorHex || undefined,
          })
        )
      )

      navigate('/products')
    } catch {
      setError('Помилка при збереженні')
    } finally {
      setLoading(false)
    }
  }

  const handleAddVariant = async () => {
    if (!id) return
    await createVariant(id, { name: 'Новий варіант' })
    refresh()
  }

  if (isLoading) return <p className="text-muted-foreground">Завантаження...</p>

  return (
    <div className="max-w-2xl pb-20">
      <h1 className="text-2xl font-semibold mb-6">Редагування продукту</h1>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label>Назва</Label>
          <Input placeholder="Nike Air Max 90" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Опис</Label>
          <Textarea placeholder="Опис продукту..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Ціна</Label>
            <Input type="number" placeholder="2500" value={form.price} onChange={e => set('price', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Знижка %</Label>
            <Input type="number" placeholder="0" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Бренд</Label>
            <Input placeholder="Nike, Adidas, Puma..." value={form.brand} onChange={e => set('brand', e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Основна категорія</Label>
            <Select value={form.gender} onValueChange={v => set('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
              <SelectContent>
                {GENDER_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Категорія</Label>
          <Select value={form.categoryId} onValueChange={v => set('categoryId', v)}>
            <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
            <SelectContent>
              {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Варіанти</h2>
          <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
            <Plus size={14} className="mr-1" /> Додати варіант
          </Button>
        </div>
        {product?.variants.map(v => (
          <VariantFormRemote
            key={v.id}
            productId={id!}
            variant={v}
            onDeleted={refresh}
            onRefresh={refresh}
            onFieldsChange={handleFieldsChange}
          />
        ))}
      </div>

      <FixedBar
        onSave={handleSave}
        onCancel={() => navigate('/products')}
        loading={loading}
      />
    </div>
  )
}
