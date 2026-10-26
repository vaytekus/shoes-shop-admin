import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUsers, createUser } from '@/api/usersApi'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'

const PAGE_SIZE = 20

const emptyForm = { email: '', password: '', firstName: '', lastName: '' }

export default function UsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, debouncedSearch],
    queryFn: () => getUsers(page, PAGE_SIZE, debouncedSearch || undefined),
  })

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Користувача створено')
      setOpen(false)
      setForm(emptyForm)
      setErrors({})
    },
    onError: () => toast.error('Помилка при створенні'),
  })

  const users = data?.data.items ?? []
  const totalCount = data?.data.totalCount ?? 0
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const set = (key: keyof typeof emptyForm, val: string) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }))
  }

  const validate = () => {
    const e: Partial<typeof emptyForm> = {}
    if (!form.email.trim()) e.email = "Обов'язкове поле"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Невірний формат email'
    if (!form.password.trim()) e.password = "Обов'язкове поле"
    else if (form.password.length < 6) e.password = 'Мінімум 6 символів'
    if (!form.firstName.trim()) e.firstName = "Обов'язкове поле"
    if (!form.lastName.trim()) e.lastName = "Обов'язкове поле"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    mutation.mutate(form)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Користувачі</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} className="mr-1" /> Додати
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук по email або імені..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : users.length === 0 ? (
        <p className="text-muted-foreground">Користувачів не знайдено</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Ім'я</TableHead>
                <TableHead>Email підтверджено</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата реєстрації</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(u => (
                <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/users/${u.id}`)}>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  <TableCell className="text-sm">
                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.emailVerified ? 'outline' : 'secondary'} className="text-xs">
                      {u.emailVerified ? 'Так' : 'Ні'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.enabled ? 'default' : 'destructive'} className="text-xs">
                      {u.enabled ? 'Активний' : 'Заблокований'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(u.createdTimestamp).toLocaleDateString('uk-UA')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">{totalCount} користувачів</p>
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
                <Button variant="outline" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <Dialog open={open} onOpenChange={o => { setOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новий користувач</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Ім'я</Label>
                <Input value={form.firstName} onChange={e => set('firstName', e.target.value)} className={errors.firstName ? 'border-destructive' : ''} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Прізвище</Label>
                <Input value={form.lastName} onChange={e => set('lastName', e.target.value)} className={errors.lastName ? 'border-destructive' : ''} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className={errors.email ? 'border-destructive' : ''} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Пароль</Label>
              <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} className={errors.password ? 'border-destructive' : ''} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Скасувати</Button>
            <Button onClick={handleSubmit} disabled={mutation.isPending}>
              {mutation.isPending ? 'Створення...' : 'Створити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
