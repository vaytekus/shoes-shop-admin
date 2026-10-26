import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, GripVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  existingUrls?: string[]
  localPreviews?: string[]
  onDrop: (files: File[]) => void
  onRemoveLocal?: (index: number) => void
  onReorderLocal?: (from: number, to: number) => void
  onReorderExisting?: (from: number, to: number) => void
  onDeleteExisting?: (urls: string[]) => void
}

export default function ImageDropzone({
  existingUrls = [],
  localPreviews = [],
  onDrop,
  onRemoveLocal,
  onReorderLocal,
  onReorderExisting,
  onDeleteExisting,
}: Props) {
  const dragIndex = useRef<{ list: 'existing' | 'local'; index: number } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const handleDrop = useCallback((accepted: File[]) => {
    onDrop(accepted)
  }, [onDrop])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: handleDrop,
    noClick: false,
  })

  const onDragStart = (list: 'existing' | 'local', index: number) => {
    dragIndex.current = { list, index }
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const onDropOnThumb = (list: 'existing' | 'local', toIndex: number) => {
    if (!dragIndex.current) return
    if (dragIndex.current.list !== list) return
    const from = dragIndex.current.index
    if (from === toIndex) return
    if (list === 'local') onReorderLocal?.(from, toIndex)
    else onReorderExisting?.(from, toIndex)
    dragIndex.current = null
  }

  const toggleSelect = (url: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(url) ? next.delete(url) : next.add(url)
      return next
    })
  }

  const handleDeleteSelected = () => {
    if (selected.size === 0) return
    onDeleteExisting?.([...selected])
    setSelected(new Set())
  }

  const handleDeleteAll = () => {
    if (existingUrls.length === 0) return
    onDeleteExisting?.(existingUrls)
    setSelected(new Set())
  }

  const renderThumb = (
    url: string,
    index: number,
    list: 'existing' | 'local',
    onRemove?: () => void,
  ) => {
    const isSelected = list === 'existing' && selected.has(url)
    return (
      <div
        key={`${list}-${index}`}
        draggable
        onDragStart={() => onDragStart(list, index)}
        onDragOver={onDragOver}
        onDrop={() => onDropOnThumb(list, index)}
        onClick={() => list === 'existing' && onDeleteExisting && toggleSelect(url)}
        className={`relative w-20 h-20 rounded-md overflow-hidden border-2 cursor-grab active:cursor-grabbing group transition-colors
          ${isSelected ? 'border-destructive' : 'border-border'}
          ${list === 'existing' && onDeleteExisting ? 'cursor-pointer' : ''}`}
      >
        <img src={url} alt="" className="w-full h-full object-cover" />
        <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-destructive/20 opacity-100' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`} />
        <GripVertical size={14} className="absolute top-1 left-1 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
        {isSelected && (
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
            <X size={10} className="text-white" />
          </div>
        )}
        {!isSelected && index === 0 && (
          <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-white bg-black/50 py-0.5">
            Головне
          </span>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {(existingUrls.length > 0 || localPreviews.length > 0) && (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((url, i) => renderThumb(url, i, 'existing'))}
            {localPreviews.map((url, i) =>
              renderThumb(url, i, 'local', onRemoveLocal ? () => onRemoveLocal(i) : undefined)
            )}
          </div>
          {onDeleteExisting && existingUrls.length > 0 && (
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 size={13} className="mr-1" /> Видалити виділені ({selected.size})
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" onClick={handleDeleteAll} className="text-destructive hover:text-destructive">
                <Trash2 size={13} className="mr-1" /> Видалити всі
              </Button>
            </div>
          )}
        </div>
      )}

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md px-4 py-6 flex flex-col items-center gap-2 cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        <Upload size={18} className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          {isDragActive ? 'Відпустіть файли...' : 'Перетягніть фото або клікніть'}
        </p>
      </div>
    </div>
  )
}
