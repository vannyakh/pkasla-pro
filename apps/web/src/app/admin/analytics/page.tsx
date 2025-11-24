'use client'

import React from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">Analytics</h1>
          <p className="text-xs text-gray-600 mt-1">System-wide analytics and reports</p>
        </div>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-black">Analytics Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Analytics interface coming soon...</p>
          </CardContent>
        </Card>
    </div>
  )
}

