import { Button } from '@/components/ui/button'

interface Props {
  onSave: () => void
  onCancel: () => void
  loading?: boolean
  saveLabel?: string
}

export default function FixedBar({ onSave, onCancel, loading, saveLabel = 'Зберегти' }: Props) {
  return (
    <div className="fixed bottom-0 left-60 right-0 bg-background border-t border-border px-8 py-3 flex gap-3">
      <Button onClick={onSave} disabled={loading}>
        {loading ? 'Збереження...' : saveLabel}
      </Button>
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Скасувати
      </Button>
    </div>
  )
}
