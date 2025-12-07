'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { PanelLeftIcon } from 'lucide-react'
import ProfileMenu from './ProfileMenu'

function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      <PanelLeftIcon className="h-4 w-4" />
    </Button>
  )
}

export default function Topbar() {

  return (
    <div className="h-12 bg-sidebar sticky top-0 z-50 border-b border-sidebar-border/50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <CustomSidebarTrigger />
        {/* <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-7 h-8 text-xs border-gray-200"
            />
          </div>
        </div> */}
      </div>

      <div className="flex items-center gap-2">        
        <ProfileMenu />
      </div>
    </div>
  )
}
