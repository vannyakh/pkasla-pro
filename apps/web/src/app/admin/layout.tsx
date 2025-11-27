'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import AdminHeader from '@/components/layout/AdminHeader'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import type { User } from '@/types'
import { Spinner } from '@/components/ui/shadcn-io/spinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as User | undefined

  useEffect(() => {
    if (status !== 'loading') {
      // If not authenticated, redirect to login
      if (!user) {
        router.push('/login')
        return
      }
      // If authenticated but not admin, redirect to dashboard
      if (user.role !== 'admin') {
        router.push('/dashboard')
        return
      }
    }
  }, [status, user, router])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
        <Spinner size={30} />
        </div>
      </div>
    )
  }

  // Protect admin routes - only admins can access
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
