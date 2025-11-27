'use client'

import { memo } from 'react'
import { Bell, Search, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import ProfileMenu from '@/components/layout/ProfileMenu'
import { useClearCache } from '@/hooks/api/useAdmin'
import { Button } from '@/components/ui/button'

function AdminHeader() {
  const clearCacheMutation = useClearCache()

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear all cache? This will refresh all data.')) {
      clearCacheMutation.mutate()
    }
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search 
              className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" 
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-7 h-8 text-xs border-gray-200"
              aria-label="Search admin panel"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearCache}
          disabled={clearCacheMutation.isPending}
          className="h-8 px-2 text-xs hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
          aria-label="Clear cache"
          title="Clear cache"
        >
          <Trash2 className="h-3.5 w-3.5 text-gray-600" aria-hidden="true" />
          <span className="ml-1 hidden sm:inline">Clear Cache</span>
        </Button>
        
        <button 
          type="button"
          className="p-1.5 hover:bg-gray-100 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4 text-gray-600" aria-hidden="true" />
        </button>

        <ProfileMenu />
      </div>
    </header>
  )
}

export default memo(AdminHeader)
