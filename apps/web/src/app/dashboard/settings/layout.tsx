'use client'

import { usePathname, useRouter } from 'next/navigation'
import { User, Lock, Zap } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname?.includes('/security')) return 'security'
    if (pathname?.includes('/integrations')) return 'integrations'
    return 'profile'
  }

  const handleTabChange = (value: string) => {
    if (value === 'profile') {
      router.push('/dashboard/settings/profile')
    } else if (value === 'security') {
      router.push('/dashboard/settings/security')
    } else if (value === 'integrations') {
      router.push('/dashboard/settings/integrations')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-black">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs value={getActiveTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Integrations</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-6">{children}</div>
    </div>
  )
}
