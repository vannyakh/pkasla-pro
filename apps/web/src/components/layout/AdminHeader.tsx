'use client'

import { memo, useState } from 'react'
import { Bell, Search, Trash2, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import AdminProfileMenu from '@/components/layout/AdminProfileMenu'
import { useClearCache } from '@/hooks/api/useAdmin'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

function AdminHeader() {
  const [open, setOpen] = useState(false)
  const clearCacheMutation = useClearCache()

  const handleClearCache = () => {
    clearCacheMutation.mutate(undefined, {
      onSuccess: () => {
        setOpen(false)
      },
    })
  }

  return (
    <header className="h-12 bg-white border-b sticky top-0 z-50 border-gray-200 flex items-center justify-between px-4">
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
          onClick={() => setOpen(true)}
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

        <AdminProfileMenu />
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <AlertDialogTitle>Clear All Cache</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Are you sure you want to clear all cache? This will refresh all data and may temporarily slow down the system.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearCacheMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearCache}
              disabled={clearCacheMutation.isPending}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {clearCacheMutation.isPending ? (
                <>
                  <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Clearing...
                </>
              ) : (
                'Clear Cache'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}

export default memo(AdminHeader)
