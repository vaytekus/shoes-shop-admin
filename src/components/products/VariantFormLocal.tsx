import { useId } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import ImageDropzone from './ImageDropzone'
import SizeRangeGenerator from './SizeRangeGenerator'

export interface LocalSize {
  tempId: string
  size: string
  stockQuantity: number
}

export interface LocalVariant {
  tempId: string
  name: string
  sku: string
  colorName: string
  colorHex: string
  sizes: LocalSize[]
  images: File[]
  imagePreviews: string[]
}

interface Props {
  variant: LocalVariant
  onChange: (v: LocalVariant) => void
  onRemove: () => void
}

export default function VariantFormLocal({ variant, onChange, onRemove }: Props) {
  const uid = useId()

  const set = (key: keyof LocalVariant, val: string) =>
    onChange({ ...variant, [key]: val })

  const addSize = () =>
    onChange({
      ...variant,
      sizes: [...variant.sizes, { tempId: crypto.randomUUID(), size: '', stockQuantity: 0 }],
    })

  const updateSize = (tempId: string, key: keyof LocalSize, val: string | number) =>
    onChange({
      ...variant,
      sizes: variant.sizes.map((s) => (s.tempId === tempId ? { ...s, [key]: val } : s)),
    })

  const removeSize = (tempId: string) =>
    onChange({ ...variant, sizes: variant.sizes.filter((s) => s.tempId !== tempId) })

  const handleDrop = (files: File[]) => {
    const previews = files.map((f) => URL.createObjectURL(f))
    onChange({
      ...variant,
      images: [...variant.images, ...files],
      imagePreviews: [...variant.imagePreviews, ...previews],
    })
  }

  const removePreview = (index: number) => {
    URL.revokeObjectURL(variant.imagePreviews[index])
    onChange({
      ...variant,
      images: variant.images.filter((_, i) => i !== index),
      imagePreviews: variant.imagePreviews.filter((_, i) => i !== index),
    })
  }

  const reorderLocal = (from: number, to: number) => {
    const move = <T,>(arr: T[]) => {
      const next = [...arr]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    }
    onChange({
      ...variant,
      images: move(variant.images),
      imagePreviews: move(variant.imagePreviews),
    })
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Варіант</span>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 size={15} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-name`}>Назва</Label>
          <Input id={`${uid}-name`} value={variant.name} onChange={(e) => set('name', e.target.value)} placeholder="Чорний" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-sku`}>SKU</Label>
          <Input id={`${uid}-sku`} placeholder="NIKE-AM90-BLK" value={variant.sku} onChange={(e) => set('sku', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-colorName`}>Колір (назва)</Label>
          <Input id={`${uid}-colorName`} value={variant.colorName} onChange={(e) => set('colorName', e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${uid}-colorHex`}>Колір (HEX)</Label>
          <div className="flex gap-2">
            <Input id={`${uid}-colorHex`} value={variant.colorHex} onChange={(e) => set('colorHex', e.target.value)} placeholder="#000000" />
            {variant.colorHex && (
              <div className="w-9 h-9 rounded border border-border shrink-0" style={{ backgroundColor: variant.colorHex }} />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Розміри</Label>
        <SizeRangeGenerator
          onGenerate={(generated) => {
            const merged = generated
              .map((s) => {
                const existing = variant.sizes.find((e) => e.size === s.size)
                return { tempId: existing?.tempId ?? crypto.randomUUID(), size: s.size, stockQuantity: existing?.stockQuantity ?? 0 }
              })
              .sort((a, b) => parseFloat(a.size) - parseFloat(b.size))
            onChange({ ...variant, sizes: merged })
          }}
        />
        {variant.sizes.length === 0 && (
          <p className="text-xs text-muted-foreground">Немає розмірів</p>
        )}
        <div className="space-y-2">
          {variant.sizes.map((s) => (
            <div key={s.tempId} className="flex gap-2 items-center">
              <Input
                placeholder="Розмір (42)"
                value={s.size}
                onChange={(e) => updateSize(s.tempId, 'size', e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Кількість"
                value={s.stockQuantity}
                onChange={(e) => updateSize(s.tempId, 'stockQuantity', Number(e.target.value))}
                className="w-28"
              />
              <Badge variant={s.stockQuantity > 0 ? 'default' : 'secondary'} className="w-24 justify-center text-xs">
                {s.stockQuantity > 0 ? 'В наявності' : 'Немає'}
              </Badge>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSize(s.tempId)}>
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Фото</Label>
        <ImageDropzone
          localPreviews={variant.imagePreviews}
          onDrop={handleDrop}
          onRemoveLocal={removePreview}
          onReorderLocal={reorderLocal}
        />
      </div>
    </div>
  )
}
