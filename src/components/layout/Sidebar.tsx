import { useRef, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ShoppingBag, Users, LogOut, Sun, Moon, Camera } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/products', label: 'Продукти', icon: Package },
  { to: '/categories', label: 'Категорії', icon: Tag },
  { to: '/orders', label: 'Замовлення', icon: ShoppingBag },
  { to: '/users', label: 'Користувачі', icon: Users },
]

const AVATAR_KEY = 'admin-avatar'

function getInitials(name: string | null, email: string): string {
  if (name) {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  }
  return email.slice(0, 2).toUpperCase()
}

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const user = useAuthStore((s) => s.user)
  const { theme, toggle } = useTheme()
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatar, setAvatar] = useState<string | null>(() => localStorage.getItem(AVATAR_KEY))

  useEffect(() => {
    if (avatar) localStorage.setItem(AVATAR_KEY, avatar)
  }, [avatar])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setAvatar(reader.result as string)
    reader.readAsDataURL(file)
  }

  const displayName = user?.name ?? user?.email ?? ''
  const initials = user ? getInitials(user.name, user.email) : '?'

  return (
    <aside className="w-60 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="px-6 py-5 border-b border-sidebar-border">
        <span className="font-semibold text-sidebar-foreground text-lg">Shoes Admin</span>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* Profile block */}
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="relative shrink-0 group">
            <div
              className="w-9 h-9 rounded-full overflow-hidden bg-sidebar-accent flex items-center justify-center cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-xs font-semibold text-sidebar-accent-foreground">{initials}</span>
              }
            </div>
            <div
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Camera size={12} className="text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{displayName}</p>
            {user?.name && <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>}
          </div>
        </div>

        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          {theme === 'dark' ? 'Світла тема' : 'Темна тема'}
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <LogOut size={16} />
          Вийти
        </button>
      </div>
    </aside>
  )
}
