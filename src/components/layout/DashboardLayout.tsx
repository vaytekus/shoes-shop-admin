import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from '@/components/ui/sonner'

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
      <Toaster richColors position="bottom-right" />
    </div>
  )
}
