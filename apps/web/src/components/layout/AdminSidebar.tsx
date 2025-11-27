'use client'

import { memo, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Heart,
  UserCheck,
  Component,
  type LucideIcon
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
}

const MENU_ITEMS: readonly MenuItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/subscriptions', label: 'Subscriptions', icon: UserCheck },
  { href: '/admin/template', label: 'Template', icon: Component },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
] as const

function AdminSidebar() {
  const pathname = usePathname()

  const isActivePath = useMemo(() => {
    return (href: string) => {
      if (href === '/admin') {
        return pathname === href
      }
      return pathname === href || pathname?.startsWith(`${href}/`)
    }
  }, [pathname])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2 group-data-[collapsible=icon]:justify-center">
          <Heart className="h-4 w-4 text-black shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold text-black group-data-[collapsible=icon]:hidden">
            Pkasla Admin
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.href)
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default memo(AdminSidebar)
