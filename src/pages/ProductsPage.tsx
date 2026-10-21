import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProducts, deleteProduct } from '@/api/productsApi'
import { getCategories } from '@/api/categoriesApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DeleteDialog from '@/components/ui/delete-dialog'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { Product } from '@/types'

const SECTION_OPTIONS = [
  { value: 'men', label: 'Чоловіче' },
  { value: 'women', label: 'Жіноче' },
  { value: 'bags', label: 'Сумки' },
  { value: 'accessories', label: 'Аксесуари' },
]

const NO_CATEGORY = '__none__'

export default function ProductsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [openItems, setOpenItems] = useState<string[]>([])

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => getProducts(1, 500),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-all'] })
      toast.success('Продукт видалено')
    },
    onError: () => toast.error('Помилка при видаленні'),
  })

  const allProducts = productsData?.data.items ?? []
  const allCategories = categoriesData?.data ?? []

  const filteredCategories = useMemo(() =>
    selectedSection
      ? allCategories.filter(c => c.section === selectedSection)
      : allCategories,
    [allCategories, selectedSection]
  )

  const filteredProducts = useMemo(() => {
    let items = allProducts
    if (selectedSection) items = items.filter(p => p.section === selectedSection)
    if (selectedCategoryId) items = items.filter(p =>
      selectedCategoryId === NO_CATEGORY ? !p.categoryId : p.categoryId === selectedCategoryId
    )
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) || (p.brand ?? '').toLowerCase().includes(q)
      )
    }
    return items
  }, [allProducts, selectedSection, selectedCategoryId, search])

  const grouped = useMemo(() => {
    const map = new Map<string, { label: string; items: Product[] }>()
    for (const p of filteredProducts) {
      const key = (p.categoryId ?? NO_CATEGORY) + (p.section ?? '')
      const categoryName = p.categoryName ?? 'Без категорії'
      const sectionLabel = p.section
        ? SECTION_OPTIONS.find(s => s.value === p.section)?.label
        : null
      const label = sectionLabel ? `${categoryName} (${sectionLabel})` : categoryName
      if (!map.has(key)) map.set(key, { label, items: [] })
      map.get(key)!.items.push(p)
    }
    return [...map.entries()].map(([key, val]) => ({ key, ...val }))
  }, [filteredProducts])

  useEffect(() => {
    if (search.trim() || selectedCategoryId) {
      setOpenItems(grouped.map(g => g.key))
    }
  }, [search, selectedCategoryId, grouped])

  const handleSectionChange = (val: string) => {
    setSelectedSection(val === 'all' ? '' : val)
    setSelectedCategoryId('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Продукти</h1>
        <Button asChild size="sm">
          <Link to="/products/create">
            <Plus size={16} className="mr-1" /> Додати
          </Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Пошук за назвою або брендом..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedSection || 'all'} onValueChange={handleSectionChange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі розділи</SelectItem>
            {SECTION_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select
          value={selectedCategoryId || 'all'}
          onValueChange={v => setSelectedCategoryId(v === 'all' ? '' : v)}
          disabled={!selectedSection}
        >
          <SelectTrigger className="w-48"><SelectValue placeholder="Всі категорії" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всі категорії</SelectItem>
            {filteredCategories.map(c => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}{!selectedSection && c.section ? ` (${SECTION_OPTIONS.find(s => s.value === c.section)?.label ?? c.section})` : ''}
              </SelectItem>
            ))}
            <SelectItem value={NO_CATEGORY}>Без категорії</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Завантаження...</p>
      ) : grouped.length === 0 ? (
        <p className="text-muted-foreground">Нічого не знайдено</p>
      ) : (
        <Accordion type="multiple" value={openItems} onValueChange={setOpenItems} className="space-y-2">
          {grouped.map(group => (
            <AccordionItem key={group.key} value={group.key} className="border border-border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{group.label}</span>
                  <Badge variant="secondary" className="text-xs">{group.items.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="divide-y divide-border">
                  {group.items.map(p => (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 py-3 cursor-pointer hover:bg-muted/50 rounded-md px-2 -mx-2 transition-colors"
                      onClick={() => navigate(`/products/${p.id}/edit`)}
                    >
                      {p.variants[0]?.imageUrls[0] && (
                        <img
                          src={p.variants[0].imageUrls[0]}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-md shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.brand ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0" onClick={e => e.stopPropagation()}>
                        <span className="text-sm">{p.price.toLocaleString('uk-UA')} ₴</span>
                        {p.discountPercent ? (
                          <Badge variant="destructive" className="text-xs">-{p.discountPercent}%</Badge>
                        ) : null}
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/products/${p.id}/edit`}><Pencil size={14} /></Link>
                        </Button>
                        <DeleteDialog
                          title={`Видалити "${p.name}"?`}
                          description="Продукт і всі його варіанти будуть видалені назавжди."
                          onConfirm={() => deleteMutation.mutate(p.id)}
                        >
                          <Button variant="ghost" size="icon"><Trash2 size={14} /></Button>
                        </DeleteDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
