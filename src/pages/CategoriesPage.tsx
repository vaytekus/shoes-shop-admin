import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/api/categoriesApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Trash2, Pencil, Check, X } from 'lucide-react'

export default function CategoriesPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setName('')
      setSlug('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  const categories = data?.data ?? []

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = (id: string) => {
    if (!editingName.trim()) return
    updateMutation.mutate({ id, name: editingName.trim() })
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Категорії</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, slug }) }}
        className="flex gap-3 mb-8 items-end max-w-lg"
      >
        <div className="flex-1 space-y-1.5">
          <Label>Назва</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Slug</Label>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
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
                  ) : (
                    c.name
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{c.slug}</TableCell>
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
                        <Button variant="ghost" size="icon" onClick={() => startEdit(c.id, c.name)}>
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { if (confirm(`Видалити "${c.name}"?`)) deleteMutation.mutate(c.id) }}
                        >
                          <Trash2 size={15} />
                        </Button>
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
