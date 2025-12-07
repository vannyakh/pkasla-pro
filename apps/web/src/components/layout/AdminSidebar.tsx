'use client'

import { memo, useMemo } from 'react'
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  UserCheck,
  Component,
  ChevronRight,
  type LucideIcon,
  BarChart3,
  FileText,
  CreditCard
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  useSidebar,
} from '@/components/ui/sidebar'
import * as Collapsible from '@radix-ui/react-collapsible'

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
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
  { href: '/admin/payment-logs', label: 'Payment Logs', icon: CreditCard },
] as const

function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const [openItems, setOpenItems] = React.useState<Record<string, boolean>>(() => {
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
        <Link href="/admin" className="flex items-center space-x-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
          <Image
            src="/logo.png"
            alt="Pkasla Admin Logo"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
            priority
          />
          <span className="text-sm font-semibold text-foreground group-data-[collapsible=icon]:hidden">
            Pkasla Admin
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENU_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = isActivePath(item.href)
                const hasChildren = item.children && item.children.length > 0
                const hasActiveChild = hasChildren && item.children!.some((child) => isActivePath(child.href))
                
                if (hasChildren) {
                  const isOpen = openItems[item.href] ?? false
                  
                  // Show Popover only when collapsed
                  if (isCollapsed) {
                    return (
                      <Popover key={item.href}>
                        <SidebarMenuItem>
                          <PopoverTrigger asChild>
                            <SidebarMenuButton
                              isActive={isActive || hasActiveChild}
                              tooltip={item.label}
                              size="xl"
                              variant="rounded"
                              className="px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                            >
                              <Icon className="h-5 w-5 shrink-0 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" aria-hidden="true" />
                              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </SidebarMenuButton>
                          </PopoverTrigger>
                          <PopoverContent 
                            side="right" 
                            align="start"
                            className="w-56 p-2"
                            sideOffset={8}
                          >
                            <div className="flex flex-col gap-1">
                              {item.children!.map((child) => {
                                const isChildActive = isActivePath(child.href)
                                return (
                                  <Link
                                    key={child.href}
                                    href={child.href}
                                    className={`
                                      flex items-center rounded-md px-3 py-2 text-sm transition-colors
                                      ${isChildActive 
                                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
                                        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground'
                                      }
                                    `}
                                    aria-current={isChildActive ? 'page' : undefined}
                                  >
                                    {child.label}
                                  </Link>
                                )
                              })}
                            </div>
                          </PopoverContent>
                        </SidebarMenuItem>
                      </Popover>
                    )
                  }
                  
                  // Show inline collapsible when expanded
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
                            size="xl"
                            variant="rounded"
                            className="px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                          >
                            <Icon className="h-5 w-5 shrink-0 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" aria-hidden="true" />
                            <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            <ChevronRight
                              className={`ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[collapsible=icon]:hidden ${
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
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.label}
                      size="xl"
                      variant="rounded"
                      className="px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2"
                    >
                      <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                        <Icon className="h-5 w-5 shrink-0 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" aria-hidden="true" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
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
