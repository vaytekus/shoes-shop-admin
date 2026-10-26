import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import DeleteDialog from '@/components/ui/delete-dialog'
import ImageDropzone from './ImageDropzone'
import SizeRangeGenerator from './SizeRangeGenerator'
import type { ProductVariant } from '@/types'
import { deleteVariant, uploadImages, reorderImages, deleteImages, addSize, updateSize, deleteSize } from '@/api/productsApi'
import { toast } from 'sonner'

export interface VariantFields {
  name: string
  sku: string
  colorName: string
  colorHex: string
}

interface Props {
  productId: string
  variant: ProductVariant
  onDeleted: () => void
  onRefresh: () => void
  onFieldsChange: (variantId: string, fields: VariantFields) => void
  uploadCtx?: { section?: string; category?: string; brand?: string; modelName?: string }
}

export default function VariantFormRemote({ productId, variant, onDeleted, onRefresh, onFieldsChange, uploadCtx }: Props) {
  const [name, setName] = useState(variant.name)
  const [sku, setSku] = useState(variant.sku ?? '')
  const [colorName, setColorName] = useState(variant.colorName ?? '')
  const [colorHex, setColorHex] = useState(variant.colorHex ?? '')

  useEffect(() => {
    onFieldsChange(variant.id, { name, sku, colorName, colorHex })
  }, [name, sku, colorName, colorHex])

  const handleDelete = async () => {
    await deleteVariant(productId, variant.id)
    toast.success('Варіант видалено')
    onDeleted()
  }

  const handleDrop = async (files: File[]) => {
    await uploadImages(productId, variant.id, files, uploadCtx)
    toast.success('Фото завантажено')
    onRefresh()
  }

  const handleDeleteExisting = async (urls: string[]) => {
    await deleteImages(productId, variant.id, urls)
    toast.success(urls.length > 1 ? `Видалено ${urls.length} фото` : 'Фото видалено')
    onRefresh()
  }

  const handleReorderExisting = async (from: number, to: number) => {
    const urls = [...variant.imageUrls]
    const [moved] = urls.splice(from, 1)
    urls.splice(to, 0, moved)
    await reorderImages(productId, variant.id, urls)
    onRefresh()
  }

  const handleUpdateStock = async (sizeId: string, size: string, stockQuantity: number) => {
    await updateSize(productId, variant.id, sizeId, { size, stockQuantity })
    onRefresh()
  }

  const handleDeleteSize = async (sizeId: string) => {
    await deleteSize(productId, variant.id, sizeId)
    onRefresh()
  }

  return (
    <div className="border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">ID: {variant.id.slice(0, 8)}...</span>
        <DeleteDialog
          title={`Видалити варіант "${variant.name}"?`}
          description="Варіант, всі його фото і розміри будуть видалені назавжди."
          onConfirm={handleDelete}
        >
          <Button type="button" variant="ghost" size="icon">
            <Trash2 size={15} />
          </Button>
        </DeleteDialog>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Назва</Label>
          <Input placeholder="Чорний" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>SKU</Label>
          <Input placeholder="NIKE-AM90-BLK" value={sku} onChange={(e) => setSku(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Колір (назва)</Label>
          <Input placeholder="Чорний" value={colorName} onChange={(e) => setColorName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Колір (HEX)</Label>
          <div className="flex gap-2">
            <Input value={colorHex} onChange={(e) => setColorHex(e.target.value)} placeholder="#000000" />
            {colorHex && (
              <div className="w-9 h-9 rounded border border-border shrink-0" style={{ backgroundColor: colorHex }} />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Розміри</Label>
        <SizeRangeGenerator
          onGenerate={async (generated) => {
            const generatedSizes = new Set(generated.map((s) => s.size))
            const existingSizes = new Set(variant.sizes.map((s) => s.size))
            for (const s of variant.sizes) {
              if (!generatedSizes.has(s.size)) await deleteSize(productId, variant.id, s.id)
            }
            for (const s of generated) {
              if (!existingSizes.has(s.size)) await addSize(productId, variant.id, s)
            }
            onRefresh()
          }}
        />
        <div className="space-y-2">
          {[...variant.sizes].sort((a, b) => parseFloat(a.size) - parseFloat(b.size)).map((s) => (
            <div key={s.id} className="flex gap-2 items-center">
              <Input value={s.size} readOnly className="flex-1 bg-muted" />
              <Input
                type="number"
                defaultValue={s.stockQuantity}
                className="w-28"
                onBlur={(e) => handleUpdateStock(s.id, s.size, Number(e.target.value))}
              />
              <Badge variant={s.stockQuantity > 0 ? 'default' : 'secondary'} className="w-24 justify-center text-xs">
                {s.stockQuantity > 0 ? 'В наявності' : 'Немає'}
              </Badge>
              <Button type="button" variant="ghost" size="icon" onClick={() => handleDeleteSize(s.id)}>
                <Trash2 size={13} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Фото</Label>
        <ImageDropzone
          existingUrls={variant.imageUrls}
          onDrop={handleDrop}
          onReorderExisting={handleReorderExisting}
          onDeleteExisting={handleDeleteExisting}
        />
      </div>
    </div>
  )
}
