import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/categoriesApi'
import client from '@/api/client'
import { createVariant, uploadImages, addSize } from '@/api/productsApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import VariantFormLocal, { type LocalVariant } from '@/components/products/VariantFormLocal'
import FixedBar from '@/components/layout/FixedBar'
import { Plus } from 'lucide-react'

const GENDER_OPTIONS = [
  { value: 'men', label: 'Чоловіче' },
  { value: 'women', label: 'Жіноче' },
  { value: 'kids', label: 'Дитяче' },
  { value: 'bags', label: 'Сумки' },
  { value: 'accessories', label: 'Аксесуари' },
]

function createEmptyVariant(): LocalVariant {
  return {
    tempId: crypto.randomUUID(),
    name: '', sku: '', colorName: '', colorHex: '',
    sizes: [], images: [], imagePreviews: [],
  }
}

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const categories = categoriesData?.data ?? []

  const [form, setForm] = useState({
    name: '', description: '', price: '', brand: '',
    gender: '', discountPercent: '', categoryId: '',
  })
  const [variants, setVariants] = useState<LocalVariant[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  const updateVariant = (tempId: string, updated: LocalVariant) =>
    setVariants(vs => vs.map(v => v.tempId === tempId ? updated : v))

  const removeVariant = (tempId: string) =>
    setVariants(vs => vs.filter(v => v.tempId !== tempId))

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await client.post<string>('/products', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        brand: form.brand || null,
        gender: form.gender || null,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
        categoryId: form.categoryId || null,
      })
      const productId = res.data

      for (const v of variants) {
        const variantRes = await createVariant(productId, {
          name: v.name,
          sku: v.sku || undefined,
          colorName: v.colorName || undefined,
          colorHex: v.colorHex || undefined,
        })
        const variantId = variantRes.data

        if (v.images.length > 0) {
          await uploadImages(productId, variantId, v.images)
        }

        for (const s of v.sizes) {
          await addSize(productId, variantId, { size: s.size, stockQuantity: s.stockQuantity })
        }
      }

      navigate('/products')
    } catch {
      setError('Помилка при створенні продукту')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl pb-20">
      <h1 className="text-2xl font-semibold mb-6">Новий продукт</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label>Назва</Label>
          <Input placeholder="Nike Air Max 90" value={form.name} onChange={e => set('name', e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label>Опис</Label>
          <Textarea placeholder="Опис продукту..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Ціна</Label>
            <Input type="number" placeholder="2500" value={form.price} onChange={e => set('price', e.target.value)} required />
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base">Варіанти</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants(vs => [...vs, createEmptyVariant()])}>
              <Plus size={14} className="mr-1" /> Додати варіант
            </Button>
          </div>
          {variants.map(v => (
            <VariantFormLocal
              key={v.tempId}
              variant={v}
              onChange={updated => updateVariant(v.tempId, updated)}
              onRemove={() => removeVariant(v.tempId)}
            />
          ))}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      <FixedBar
        onSave={handleSubmit}
        onCancel={() => navigate('/products')}
        loading={loading}
        saveLabel="Створити"
      />
    </div>
  )
}
