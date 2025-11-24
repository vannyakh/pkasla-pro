'use client'

import React from 'react'
import { Bell, Search } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'

export default function Topbar() {
  const { user } = useAuth()

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-7 h-8 text-xs border-gray-200"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-1.5 hover:bg-gray-100 rounded">
          <Bell className="h-4 w-4 text-gray-600" />
        </button>
        <div className="h-7 w-7 bg-gray-200 rounded-full flex items-center justify-center text-xs text-black font-medium">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  )
}
