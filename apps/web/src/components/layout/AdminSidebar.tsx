'use client'

import { memo, useMemo, useCallback, useState, useEffect } from 'react'
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
  UserCircle,
  Wallet
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
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
  SidebarRail,
} from '@/components/ui/sidebar'
import * as Collapsible from '@radix-ui/react-collapsible'

interface MenuItem {
  href: string
  label: string
  icon: LucideIcon
  children?: readonly { href: string; label: string }[]
}

interface MenuSection {
  label?: string
  items: readonly MenuItem[]
}

const MENU_SECTIONS: readonly MenuSection[] = [
  {
    label: 'Overview',
    items: [
      { 
        href: '/admin', 
        label: 'Dashboard', 
        icon: LayoutDashboard 
      },
      { 
        href: '/admin/analytics', 
        label: 'Analytics', 
        icon: BarChart3 
      },
    ]
  },
  {
    label: 'Management',
    items: [
      { 
        href: '/admin/users', 
        label: 'Users', 
        icon: Users 
      },
      { 
        href: '/admin/t', 
        label: 'Templates', 
        icon: Component 
      },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { 
        href: '/admin/subscriptions', 
        label: 'Subscriptions', 
        icon: UserCheck,
        children: [
          { href: '/admin/plans', label: 'Plans' },
          { href: '/admin/subscriptions', label: 'All Subscriptions' },
          { href: '/admin/templatepurchases', label: 'Template Purchases' },
        ]
      },
      { 
        href: '/admin/billing', 
        label: 'Billing & Payments', 
        icon: Wallet,
        children: [
          { href: '/admin/billing', label: 'Billing Overview' },
          { href: '/admin/payment-logs', label: 'Payment Logs' },
        ]
      },
    ]
  },
  {
    label: 'System',
    items: [
      { 
        href: '/admin/settings', 
        label: 'Settings', 
        icon: Settings 
      },
      { 
        href: '/admin/audit-logs', 
        label: 'Audit Logs', 
        icon: FileText 
      },
    ]
  },
  {
    label: 'Account',
    items: [
      { 
        href: '/admin/profile', 
        label: 'Profile', 
        icon: UserCircle 
      },
    ]
  },
] as const

// Flatten menu items for pathname checking
const ALL_MENU_ITEMS = MENU_SECTIONS.flatMap(section => section.items)

// Utility function to check if path is active
const checkIsActivePath = (pathname: string, href: string): boolean => {
  if (href === '/admin') {
    return pathname === href
  }
  return pathname === href || pathname?.startsWith(`${href}/`)
}

// Get initial open items based on pathname
const getInitialOpenItems = (pathname: string): Record<string, boolean> => {
  const initial: Record<string, boolean> = {}
  ALL_MENU_ITEMS.forEach((item) => {
    if (item.children) {
      const hasActiveChild = item.children.some((child) => 
        checkIsActivePath(pathname, child.href)
      )
      initial[item.href] = hasActiveChild
    }
  })
  return initial
}

// Memoized submenu item component
const SubmenuItem = memo(({ 
  href, 
  label, 
  isActive 
}: { 
  href: string
  label: string
  isActive: boolean 
}) => (
  <Link
    href={href}
    className={`
      flex items-center rounded-md px-3 py-2 text-sm transition-colors
      ${isActive 
        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' 
        : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground'
      }
    `}
    aria-current={isActive ? 'page' : undefined}
  >
    {label}
  </Link>
))
SubmenuItem.displayName = 'SubmenuItem'

// Memoized popover menu for collapsed state
const CollapsedMenuWithChildren = memo(({ 
  item, 
  isActive, 
  hasActiveChild,
  pathname 
}: { 
  item: MenuItem
  isActive: boolean
  hasActiveChild: boolean
  pathname: string
}) => {
  const Icon = item.icon
  
  return (
    <Popover>
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
            {item.children!.map((child) => (
              <SubmenuItem
                key={child.href}
                href={child.href}
                label={child.label}
                isActive={checkIsActivePath(pathname, child.href)}
              />
            ))}
          </div>
        </PopoverContent>
      </SidebarMenuItem>
    </Popover>
  )
})
CollapsedMenuWithChildren.displayName = 'CollapsedMenuWithChildren'

// Memoized expandable menu for expanded state
const ExpandableMenuItem = memo(({ 
  item, 
  isActive, 
  hasActiveChild, 
  isOpen,
  onToggle,
  pathname
}: { 
  item: MenuItem
  isActive: boolean
  hasActiveChild: boolean
  isOpen: boolean
  onToggle: () => void
  pathname: string
}) => {
  const Icon = item.icon
  
  return (
    <Collapsible.Root open={isOpen} onOpenChange={onToggle}>
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
              const isChildActive = checkIsActivePath(pathname, child.href)
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
})
ExpandableMenuItem.displayName = 'ExpandableMenuItem'

// Memoized simple menu item
const SimpleMenuItem = memo(({ 
  item, 
  isActive 
}: { 
  item: MenuItem
  isActive: boolean 
}) => {
  const Icon = item.icon
  
  return (
    <SidebarMenuItem>
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
})
SimpleMenuItem.displayName = 'SimpleMenuItem'

function AdminSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  
  // Initialize open items state
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  // Update open items when pathname changes
  useEffect(() => {
    setOpenItems(getInitialOpenItems(pathname))
  }, [pathname])

  // Memoized toggle function
  const toggleItem = useCallback((href: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }))
  }, [])

  // Memoized active path checker
  const isActivePath = useCallback((href: string) => {
    return checkIsActivePath(pathname, href)
  }, [pathname])

  // Memoized menu sections rendering
  const menuSections = useMemo(() => {
    return MENU_SECTIONS.map((section, sectionIndex) => (
      <SidebarGroup key={section.label || sectionIndex}>
        {section.label && !isCollapsed && (
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/70 uppercase tracking-wider px-4">
            {section.label}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu>
            {section.items.map((item) => {
              const isActive = isActivePath(item.href)
              const hasChildren = item.children && item.children.length > 0
              const hasActiveChild = Boolean(hasChildren && item.children!.some((child) => isActivePath(child.href)))
              
              if (hasChildren) {
                const isOpen = openItems[item.href] ?? false
                
                // Show Popover only when collapsed
                if (isCollapsed) {
                  return (
                    <CollapsedMenuWithChildren
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      hasActiveChild={hasActiveChild}
                      pathname={pathname}
                    />
                  )
                }
                
                // Show inline collapsible when expanded
                return (
                  <ExpandableMenuItem
                    key={item.href}
                    item={item}
                    isActive={isActive}
                    hasActiveChild={hasActiveChild}
                    isOpen={isOpen}
                    onToggle={() => toggleItem(item.href)}
                    pathname={pathname}
                  />
                )
              }
              
              return (
                <SimpleMenuItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                />
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    ))
  }, [pathname, isCollapsed, openItems, isActivePath, toggleItem])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link 
          href="/dashboard" 
          className="flex items-center space-x-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full"
        >
          <Image
            src="/logo.png"
            alt="Pkasla Logo"
            width={512}
            height={512}
            className="h-12 w-full shrink-0 object-contain"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {menuSections}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

export default memo(AdminSidebar)
