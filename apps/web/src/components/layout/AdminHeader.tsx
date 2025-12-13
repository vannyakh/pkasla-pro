'use client'

import { memo, useState, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Bell, 
  Search, 
  Trash2, 
  AlertTriangle, 
  Zap, 
  RefreshCw,
  Settings,
  Shield,
  Database,
  Activity,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Mock notifications data - replace with real API call
const mockNotifications = [
  { id: 1, title: 'New user registration', description: 'John Doe just signed up', time: '5 min ago', read: false },
  { id: 2, title: 'Payment received', description: 'Payment of $99 received', time: '1 hour ago', read: false },
  { id: 3, title: 'Server backup completed', description: 'Daily backup finished successfully', time: '2 hours ago', read: true },
]

// Breadcrumb generator
const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  
  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    breadcrumbs.push({ label, path: currentPath })
  }
  
  return breadcrumbs
}

function AdminHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [clearCacheOpen, setClearCacheOpen] = useState(false)
  const clearCacheMutation = useClearCache()

  const breadcrumbs = useMemo(() => getBreadcrumbs(pathname), [pathname])
  const unreadCount = mockNotifications.filter(n => !n.read).length

  const handleClearCache = () => {
    clearCacheMutation.mutate(undefined, {
      onSuccess: () => {
        setClearCacheOpen(false)
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 bg-sidebar border-b border-sidebar-border/50">
      {/* Main Header Bar */}
      <div className="h-14 flex items-center justify-between px-4 gap-4">
        {/* Left Section - Sidebar Trigger + Search */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <SidebarTrigger />
          
          {/* Breadcrumbs - Hidden on small screens */}
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                <Link
                  href={crumb.path}
                  className={`hover:text-foreground transition-colors ${
                    index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''
                  }`}
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md hidden lg:block">
          <div className="relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" 
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search users, templates, settings..."
              className="pl-9 h-9 text-sm"
              aria-label="Search admin panel"
            />
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1">
          {/* System Status Indicator */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-2 gap-2 hidden xl:flex"
            title="System Status"
          >
            <Activity className="h-4 w-4 text-green-500" />
            <span className="text-xs">All Systems Operational</span>
          </Button>

          {/* Quick Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 px-2"
                aria-label="Quick actions"
                title="Quick Actions"
              >
                <Zap className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setClearCacheOpen(true)}
                disabled={clearCacheMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Clear Cache</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.reload()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Refresh Page</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>System Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/audit-logs')}>
                <Shield className="mr-2 h-4 w-4" />
                <span>Audit Logs</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/analytics')}>
                <Database className="mr-2 h-4 w-4" />
                <span>View Analytics</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 px-2 relative"
                aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary">{unreadCount} new</Badge>
                  )}
                </div>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {mockNotifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 hover:bg-accent cursor-pointer transition-colors ${
                        !notification.read ? 'bg-accent/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`h-2 w-2 rounded-full mt-2 ${
                          !notification.read ? 'bg-blue-500' : 'bg-transparent'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {mockNotifications.length > 0 && (
                <div className="border-t p-2">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    View all notifications
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {/* Profile Menu */}
          <AdminProfileMenu />
        </div>
      </div>

      {/* Clear Cache Dialog */}
      <AlertDialog open={clearCacheOpen} onOpenChange={setClearCacheOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
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
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 dark:bg-red-900 dark:hover:bg-red-800"
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
