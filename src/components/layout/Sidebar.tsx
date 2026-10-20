import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, Tag, ShoppingBag, LogOut, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/products', label: 'Продукти', icon: Package },
  { to: '/categories', label: 'Категорії', icon: Tag },
  { to: '/orders', label: 'Замовлення', icon: ShoppingBag },
]

export default function Sidebar() {
  const logout = useAuthStore((s) => s.logout)
  const { theme, toggle } = useTheme()

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
