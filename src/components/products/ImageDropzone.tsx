import { useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, GripVertical } from 'lucide-react'

interface Props {
  existingUrls?: string[]
  localPreviews?: string[]
  onDrop: (files: File[]) => void
  onRemoveLocal?: (index: number) => void
  onReorderLocal?: (from: number, to: number) => void
  onReorderExisting?: (from: number, to: number) => void
}

export default function ImageDropzone({
  existingUrls = [],
  localPreviews = [],
  onDrop,
  onRemoveLocal,
  onReorderLocal,
  onReorderExisting,
}: Props) {
  const dragIndex = useRef<{ list: 'existing' | 'local'; index: number } | null>(null)

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

  const renderThumb = (
    url: string,
    index: number,
    list: 'existing' | 'local',
    onRemove?: () => void,
  ) => (
    <div
      key={`${list}-${index}`}
      draggable
      onDragStart={() => onDragStart(list, index)}
      onDragOver={onDragOver}
      onDrop={() => onDropOnThumb(list, index)}
      className="relative w-20 h-20 rounded-md overflow-hidden border border-border cursor-grab active:cursor-grabbing group"
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      <GripVertical size={14} className="absolute top-1 left-1 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
      {index === 0 && (
        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-white bg-black/50 py-0.5">
          Головне
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 text-white hover:bg-black opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X size={10} />
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      {(existingUrls.length > 0 || localPreviews.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {existingUrls.map((url, i) => renderThumb(url, i, 'existing'))}
          {localPreviews.map((url, i) =>
            renderThumb(url, i, 'local', onRemoveLocal ? () => onRemoveLocal(i) : undefined)
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
