'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CreditCard, Calendar } from 'lucide-react'

interface SubscriptionStatsCardProps {
  stats: {
    count: number
    monthlyRecurring: number
    yearlyRecurring: number
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function SubscriptionStatsCard({ stats }: SubscriptionStatsCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <CardTitle className="text-sm font-semibold text-black">Active Subscriptions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Active</p>
                <p className="text-lg font-semibold text-black">{stats.count}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-600 mb-1">Monthly MRR</p>
              <p className="text-base font-semibold text-black">{formatCurrency(stats.monthlyRecurring)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Yearly ARR</p>
              <p className="text-base font-semibold text-black">{formatCurrency(stats.yearlyRecurring)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

