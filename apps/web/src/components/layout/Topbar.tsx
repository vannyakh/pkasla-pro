'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import ProfileMenu from './ProfileMenu'

export default function Topbar() {

  return (
    <div className="h-12 bg-sidebar sticky top-0 z-50 border-b border-sidebar-border/50 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
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
