'use client'

import { memo, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Heart,
  UserCheck,
  Component,
  ChevronRight,
  type LucideIcon,
  BarChart3
} from 'lucide-react'
import * as Collapsible from '@radix-ui/react-collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar'

interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
  children?: readonly { href: string; label: string }[]
}

const MENU_ITEMS: readonly MenuItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { 
    href: '/admin/subscriptions', 
    label: 'Subscriptions', 
    icon: UserCheck,
    children: [
      { href: '/admin/plans', label: 'Plans' },
      { href: '/admin/subscriptions', label: 'Subscriptions' },
      { href: '/admin/templatepurchases', label: 'Template Purchases' },
    ]
  },
  { href: '/admin/t', label: 'Template', icon: Component },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
] as const

function AdminSidebar() {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    // Auto-open if any child is active
    const initial: Record<string, boolean> = {}
    MENU_ITEMS.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => {
          if (child.href === '/admin') {
            return pathname === child.href
          }
          return pathname === child.href || pathname?.startsWith(`${child.href}/`)
        })
        initial[item.href] = hasActiveChild
      }
    })
    return initial
  })

  const isActivePath = useMemo(() => {
    return (href: string) => {
      if (href === '/admin') {
        return pathname === href
      }
      return pathname === href || pathname?.startsWith(`${href}/`)
    }
  }, [pathname])

  const toggleItem = (href: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }))
  }

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
                const hasChildren = item.children && item.children.length > 0
                const isOpen = openItems[item.href] ?? false
                const hasActiveChild = hasChildren && item.children!.some((child) => isActivePath(child.href))
                
                if (hasChildren) {
                  return (
                    <Collapsible.Root
                      key={item.href}
                      open={isOpen}
                      onOpenChange={() => toggleItem(item.href)}
                    >
                      <SidebarMenuItem>
                        <Collapsible.Trigger asChild>
                          <SidebarMenuButton
                            isActive={isActive || hasActiveChild}
                            tooltip={item.label}
                            aria-expanded={isOpen}
                          >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{item.label}</span>
                            <ChevronRight
                              className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 ${
                                isOpen ? 'rotate-90' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </SidebarMenuButton>
                        </Collapsible.Trigger>
                        <Collapsible.Content>
                          <SidebarMenuSub>
                            {item.children!.map((child) => {
                              const isChildActive = isActivePath(child.href)
                              return (
                                <SidebarMenuSubItem key={child.href}>
                                  <SidebarMenuSubButton asChild isActive={isChildActive}>
                                    <Link href={child.href} aria-current={isChildActive ? 'page' : undefined}>
                                      <span>{child.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </Collapsible.Content>
                      </SidebarMenuItem>
                    </Collapsible.Root>
                  )
                }
                
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
