'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, DollarSign, ShoppingCart, CreditCard } from 'lucide-react'

interface RevenueCardProps {
  title: string
  value: number
  icon: React.ReactNode
  description?: string
  trend?: number
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function RevenueCard({ title, value, icon, description, trend }: RevenueCardProps) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-gray-600 mb-1">{title}</p>
            <p className="text-xl font-semibold text-black">{formatCurrency(value)}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className={`h-3 w-3 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RevenueCards({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RevenueCard
        title="Total Revenue"
        value={stats.totalRevenue}
        icon={<DollarSign className="h-5 w-5 text-blue-600" />}
        description="All-time revenue"
      />
      <RevenueCard
        title="Template Revenue"
        value={stats.totalTemplateRevenue}
        icon={<ShoppingCart className="h-5 w-5 text-blue-600" />}
        description={`${stats.templatePurchases.count} purchases`}
      />
      <RevenueCard
        title="Subscription Revenue"
        value={stats.totalSubscriptionRevenue}
        icon={<CreditCard className="h-5 w-5 text-blue-600" />}
        description={`${stats.activeSubscriptions.count} active`}
      />
      <RevenueCard
        title="This Month"
        value={stats.revenueByPeriod.thisMonth}
        icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
        description="Monthly revenue"
      />
    </div>
  )
}

