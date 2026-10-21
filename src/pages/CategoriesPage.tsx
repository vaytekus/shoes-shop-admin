import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categoriesApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DeleteDialog from '@/components/ui/delete-dialog'
import { toast } from 'sonner'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Trash2, Pencil, Check, X } from 'lucide-react'

const SECTION_OPTIONS = [
  { value: 'men', label: 'Чоловіче' },
  { value: 'women', label: 'Жіноче' },
  { value: 'bags', label: 'Сумки' },
  { value: 'accessories', label: 'Аксесуари' },
]

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [section, setSection] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [editingSection, setEditingSection] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      setSlug('')
      setSection('')
      toast.success('Категорію створено')
    },
    onError: () => toast.error('Помилка при створенні'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name, section }: { id: string; name: string; section?: string }) =>
      updateCategory(id, name, section || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingId(null)
      toast.success('Категорію збережено')
    },
    onError: () => toast.error('Помилка при збереженні'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('Категорію видалено')
    },
    onError: () => toast.error('Помилка при видаленні'),
  })

  const categories = data?.data ?? []

  const startEdit = (id: string, currentName: string, currentSection: string | null) => {
    setEditingId(id)
    setEditingName(currentName)
    setEditingSection(currentSection ?? '')
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = (id: string) => {
    if (!editingName.trim()) return
    updateMutation.mutate({ id, name: editingName.trim(), section: editingSection || undefined })
  }

  const sectionLabel = (s: string | null) =>
    SECTION_OPTIONS.find(o => o.value === s)?.label ?? '—'

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Категорії</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, slug, section: section || undefined }) }}
        className="flex gap-3 mb-8 items-end max-w-2xl"
      >
        <div className="flex-1 space-y-1.5">
          <Label>Назва</Label>
          <Input placeholder="Кросівки" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Slug</Label>
          <Input placeholder="sneakers" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
        <div className="w-44 space-y-1.5">
          <Label>Розділ</Label>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger><SelectValue placeholder="Обрати..." /></SelectTrigger>
            <SelectContent>
              {SECTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={createMutation.isPending}>Додати</Button>
      </form>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Розділ</TableHead>
              <TableHead className="w-24" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  {editingId === c.id ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(c.id); if (e.key === 'Escape') cancelEdit() }}
                      autoFocus
                      className="h-8"
                    />
                  ) : c.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                <TableCell>
                  {editingId === c.id ? (
                    <Select value={editingSection} onValueChange={setEditingSection}>
                      <SelectTrigger className="h-8 w-36"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        {SECTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-muted-foreground">{sectionLabel(c.section)}</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {editingId === c.id ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => saveEdit(c.id)} disabled={updateMutation.isPending}>
                          <Check size={15} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                          <X size={15} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => startEdit(c.id, c.name, c.section)}>
                          <Pencil size={15} />
                        </Button>
                        <DeleteDialog
                          title={`Видалити "${c.name}"?`}
                          description="Категорію буде видалено назавжди."
                          onConfirm={() => deleteMutation.mutate(c.id)}
                        >
                          <Button variant="ghost" size="icon">
                            <Trash2 size={15} />
                          </Button>
                        </DeleteDialog>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
