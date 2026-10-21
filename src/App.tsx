import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import client from '@/api/client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProductsPage from '@/pages/ProductsPage'
import ProductCreatePage from '@/pages/ProductCreatePage'
import CategoriesPage from '@/pages/CategoriesPage'
import ProductEditPage from '@/pages/ProductEditPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import UsersPage from '@/pages/UsersPage'

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, token, setToken, logout } = useAuthStore()
  const [checking, setChecking] = useState(!token)

  useEffect(() => {
    if (token) return
    client.post<{ accessToken: string }>('/users/refresh')
      .then(res => setToken(res.data.accessToken))
      .catch(() => logout())
      .finally(() => setChecking(false))
  }, [])

  if (checking) return null
  if (!user) return <Navigate to="/login" replace />
  if (!user.roles.includes('admin')) return <div className="p-8 text-destructive">Доступ заборонено</div>
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAdmin>
              <DashboardLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/create" element={<ProductCreatePage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="users" element={<UsersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
