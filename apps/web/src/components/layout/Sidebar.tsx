'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  CreditCard, 
  FileText, 
  Settings,
  Store,
  FileCheck
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

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/guests', label: 'Guests', icon: Users },
  { href: '/dashboard/templates', label: 'My Templates', icon: FileCheck },
  { href: '/dashboard/stores', label: 'Template Store', icon: Store },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function UserSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center space-x-2 px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
          <Image
            src="/logo.png"
            alt="Pkasla Logo"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 object-contain"
            priority
          />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon
                // Check if the current path matches exactly or is a child route
                // Special handling for /dashboard to only be active on exact match
                const isActive = item.href === '/dashboard'
                  ? pathname === item.href
                  : pathname === item.href || pathname?.startsWith(item.href + '/')
                
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
                      <Link href={item.href}>
                        <Icon className="h-5 w-5 shrink-0 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6" />
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
