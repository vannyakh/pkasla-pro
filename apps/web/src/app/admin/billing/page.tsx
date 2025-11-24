'use client'

import React from 'react'
import { CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminBillingPage() {
  return (
    <div>
      <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black">Billing Overview</h1>
          <p className="text-xs text-gray-600 mt-1">Monitor all subscriptions and billing</p>
        </div>

        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-black">Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Billing overview interface coming soon...</p>
          </CardContent>
        </Card>
    </div>
  )
}

