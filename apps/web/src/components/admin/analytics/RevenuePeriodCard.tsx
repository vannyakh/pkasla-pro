'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, TrendingUp } from 'lucide-react'

interface RevenuePeriodCardProps {
  stats: {
    today: number
    thisWeek: number
    thisMonth: number
    thisYear: number
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

export function RevenuePeriodCard({ stats }: RevenuePeriodCardProps) {
  const periods = [
    { label: 'Today', value: stats.today, period: 'today' },
    { label: 'This Week', value: stats.thisWeek, period: 'week' },
    { label: 'This Month', value: stats.thisMonth, period: 'month' },
    { label: 'This Year', value: stats.thisYear, period: 'year' },
  ]

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-600" />
          <CardTitle className="text-sm font-semibold text-black">Revenue by Period</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {periods.map((period) => (
            <div key={period.period} className="flex flex-col">
              <p className="text-xs text-gray-600 mb-1">{period.label}</p>
              <p className="text-lg font-semibold text-black">{formatCurrency(period.value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

