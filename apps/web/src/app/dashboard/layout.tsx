'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import UserSidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import type { User } from '@/types'
import PageLoading from '@/components/PageLoading'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const user = session?.user as User | undefined

  useEffect(() => {
    if (status !== 'loading' && !user) {
      router.push('/login')
    }
  }, [status, user, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
        <PageLoading size="lg" text="Loading..." />
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <UserSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
