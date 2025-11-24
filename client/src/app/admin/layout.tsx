'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Topbar from '@/components/layout/Topbar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/useAuth'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Admin panel routes
  const isAdminRoute = pathname.startsWith('/admin')

  useEffect(() => {
    if (!loading && isAdminRoute) {
      // Only allow admin role to access admin panel routes
      if (!isAuthenticated) {
        router.push('/login')
      } else if (user?.role !== 'admin') {
        // Regular users should go to dashboard
        router.push('/dashbord')
      }
    }
  }, [loading, isAuthenticated, user, router, isAdminRoute])

  // Show loading only for protected admin routes
  if (loading && isAdminRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Protect admin routes - only admins can access
  if (isAdminRoute && (!isAuthenticated || user?.role !== 'admin')) {
    return null
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
