'use client'

import React from 'react'
import { Settings as SettingsIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">System Settings</h1>
          <p className="text-xs text-gray-600 mt-1">Configure system-wide settings</p>
        </div>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-black">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">System settings interface coming soon...</p>
          </CardContent>
        </Card>
    </div>
  )
}

