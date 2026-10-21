import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/api/categoriesApi'
import client from '@/api/client'
import { createVariant, uploadImages, addSize } from '@/api/productsApi'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ComboInput from '@/components/ui/combo-input'
import VariantFormLocal, { type LocalVariant } from '@/components/products/VariantFormLocal'
import FixedBar from '@/components/layout/FixedBar'
import { Plus } from 'lucide-react'
import {
  SECTION_OPTIONS, MATERIAL_OPTIONS, WIDTH_OPTIONS, SEASON_OPTIONS,
  HEEL_OPTIONS, PURPOSE_OPTIONS, STYLE_OPTIONS, COUNTRY_OPTIONS,
} from '@/constants/productOptions'

function createEmptyVariant(): LocalVariant {
  return {
    tempId: crypto.randomUUID(),
    name: '', sku: '', colorName: '', colorHex: '',
    sizes: [], images: [], imagePreviews: [],
  }
}

type Errors = Partial<Record<string, string>>

const emptyForm = {
  name: '', description: '', price: '', brand: '',
  section: '', discountPercent: '', categoryId: '',
  upperMaterial: '', liningMaterial: '', insoleMaterial: '', soleMaterial: '',
  width: '', season: '', heelHeight: '', purpose: '', style: '',
  brandCountry: '', manufactureCountry: '',
  isNew: false,
}

export default function ProductCreatePage() {
  const navigate = useNavigate()
  const { data: categoriesData } = useQuery({ queryKey: ['categories'], queryFn: getCategories })
  const categories = categoriesData?.data ?? []

  const [form, setForm] = useState(emptyForm)
  const [variants, setVariants] = useState<LocalVariant[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)

  const filteredCategories = form.section
    ? categories.filter(c => c.section === form.section)
    : categories

  const set = (key: string, val: string | boolean) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const updateVariant = (tempId: string, updated: LocalVariant) =>
    setVariants(vs => vs.map(v => v.tempId === tempId ? updated : v))

  const removeVariant = (tempId: string) =>
    setVariants(vs => vs.filter(v => v.tempId !== tempId))

  const validate = (): boolean => {
    const e: Errors = {}
    if (!form.name.trim()) e.name = "Назва обов'язкова"
    if (!form.price || Number(form.price) <= 0) e.price = 'Вкажіть ціну'
    if (form.discountPercent && (Number(form.discountPercent) < 0 || Number(form.discountPercent) > 100))
      e.discountPercent = 'Від 0 до 100'
    variants.forEach((v, i) => {
      if (!v.name.trim()) e[`variant_${i}`] = "Назва варіанту обов'язкова"
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!validate()) return
    setSubmitError('')
    setLoading(true)
    try {
      const res = await client.post<string>('/products', {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        brand: form.brand || null,
        section: form.section || null,
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
        isNew: form.isNew,
        categoryId: form.categoryId || null,
        upperMaterial: form.upperMaterial || null,
        liningMaterial: form.liningMaterial || null,
        insoleMaterial: form.insoleMaterial || null,
        soleMaterial: form.soleMaterial || null,
        width: form.width || null,
        season: form.season || null,
        heelHeight: form.heelHeight || null,
        purpose: form.purpose || null,
        style: form.style || null,
        brandCountry: form.brandCountry || null,
        manufactureCountry: form.manufactureCountry || null,
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
          await uploadImages(productId, variantId, v.images, {
            section: form.section || undefined,
            category: categories.find(c => c.id === form.categoryId)?.name,
            brand: form.brand || undefined,
            modelName: form.name || undefined,
          })
        }

        for (const s of v.sizes) {
          await addSize(productId, variantId, { size: s.size, stockQuantity: s.stockQuantity })
        }
      }

      toast.success('Продукт створено')
      navigate('/products')
    } catch {
      setSubmitError('Помилка при створенні продукту')
      toast.error('Помилка при створенні')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl pb-20">
      <h1 className="text-2xl font-semibold mb-6">Новий продукт</h1>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Основна інформація */}
        <div className="space-y-1.5">
          <Label>Назва</Label>
          <Input
            placeholder="Nike Air Max 90"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Опис</Label>
          <Textarea placeholder="Опис продукту..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Ціна</Label>
            <Input type="number" placeholder="2500" value={form.price} onChange={e => set('price', e.target.value)} className={errors.price ? 'border-destructive' : ''} />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Знижка %</Label>
            <Input type="number" placeholder="0" value={form.discountPercent} onChange={e => set('discountPercent', e.target.value)} className={errors.discountPercent ? 'border-destructive' : ''} />
            {errors.discountPercent && <p className="text-xs text-destructive">{errors.discountPercent}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Бренд</Label>
            <Input placeholder="Nike" value={form.brand} onChange={e => set('brand', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Розділ</Label>
            <Select value={form.section} onValueChange={v => { set('section', v); set('categoryId', '') }}>
              <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
              <SelectContent>
                {SECTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Категорія</Label>
            <Select value={form.categoryId} onValueChange={v => set('categoryId', v)}>
              <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
              <SelectContent>
                {filteredCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}{!form.section && c.section ? ` (${SECTION_OPTIONS.find(s => s.value === c.section)?.label ?? c.section})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isNew" checked={form.isNew} onChange={e => set('isNew', e.target.checked)} className="w-4 h-4 accent-primary" />
          <Label htmlFor="isNew">Новинка</Label>
        </div>

        {/* Матеріали */}
        <div className="pt-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Матеріали</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Матеріал верху</Label>
              <ComboInput value={form.upperMaterial} onChange={v => set('upperMaterial', v)} options={MATERIAL_OPTIONS} placeholder="Текстиль+екошкіра" />
            </div>
            <div className="space-y-1.5">
              <Label>Матеріал підкладки</Label>
              <ComboInput value={form.liningMaterial} onChange={v => set('liningMaterial', v)} options={MATERIAL_OPTIONS} placeholder="Текстиль" />
            </div>
            <div className="space-y-1.5">
              <Label>Матеріал устілки</Label>
              <ComboInput value={form.insoleMaterial} onChange={v => set('insoleMaterial', v)} options={MATERIAL_OPTIONS} placeholder="Текстиль" />
            </div>
            <div className="space-y-1.5">
              <Label>Матеріал підошви</Label>
              <ComboInput value={form.soleMaterial} onChange={v => set('soleMaterial', v)} options={MATERIAL_OPTIONS} placeholder="EBA" />
            </div>
          </div>
        </div>

        {/* Характеристики */}
        <div className="pt-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Характеристики</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Повнота</Label>
              <ComboInput value={form.width} onChange={v => set('width', v)} options={WIDTH_OPTIONS} placeholder="H" />
            </div>
            <div className="space-y-1.5">
              <Label>Сезон</Label>
              <ComboInput value={form.season} onChange={v => set('season', v)} options={SEASON_OPTIONS} placeholder="Літо" />
            </div>
            <div className="space-y-1.5">
              <Label>Висота каблука</Label>
              <ComboInput value={form.heelHeight} onChange={v => set('heelHeight', v)} options={HEEL_OPTIONS} placeholder="3.8 см" />
            </div>
            <div className="space-y-1.5">
              <Label>Призначення</Label>
              <ComboInput value={form.purpose} onChange={v => set('purpose', v)} options={PURPOSE_OPTIONS} placeholder="Повсякденні" />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Стиль взуття</Label>
              <ComboInput value={form.style} onChange={v => set('style', v)} options={STYLE_OPTIONS} placeholder="повсякденний (Casual)" />
            </div>
          </div>
        </div>

        {/* Виробництво */}
        <div className="pt-2">
          <p className="text-sm font-medium text-muted-foreground mb-3">Виробництво</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Країна реєстрації бренду</Label>
              <ComboInput value={form.brandCountry} onChange={v => set('brandCountry', v)} options={COUNTRY_OPTIONS} placeholder="Німеччина" />
            </div>
            <div className="space-y-1.5">
              <Label>Країна виробництва</Label>
              <ComboInput value={form.manufactureCountry} onChange={v => set('manufactureCountry', v)} options={COUNTRY_OPTIONS} placeholder="В'єтнам" />
            </div>
          </div>
        </div>

        {/* Варіанти */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <Label className="text-base">Варіанти</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => setVariants(vs => [createEmptyVariant(), ...vs])}>
              <Plus size={14} className="mr-1" /> Додати варіант
            </Button>
          </div>
          {variants.map((v, i) => (
            <VariantFormLocal
              key={v.tempId}
              variant={v}
              nameError={errors[`variant_${i}`]}
              onChange={updated => {
                updateVariant(v.tempId, updated)
                if (errors[`variant_${i}`]) setErrors(e => ({ ...e, [`variant_${i}`]: undefined }))
              }}
              onRemove={() => removeVariant(v.tempId)}
            />
          ))}
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}
      </form>

      <FixedBar onSave={handleSubmit} onCancel={() => navigate('/products')} loading={loading} saveLabel="Створити" />
    </div>
  )
}
