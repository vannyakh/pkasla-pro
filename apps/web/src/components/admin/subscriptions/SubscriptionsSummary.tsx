'use client'

import React from 'react'
import { CreditCard } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { UserSubscription } from '@/types/user-subscription'
import type { SubscriptionPlan } from '@/types/subscription-plan'

interface SubscriptionsSummaryProps {
  subscriptions: UserSubscription[]
}

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`
}

const getPlanPrice = (planId: string | SubscriptionPlan): number => {
  if (typeof planId === 'object' && planId !== null) {
    return planId.price || 0
  }
  return 0
}

export function SubscriptionsSummary({ subscriptions }: SubscriptionsSummaryProps) {
  const totalRevenue = React.useMemo(() => {
    return subscriptions
      .filter((sub) => sub.status === 'active')
      .reduce((sum, sub) => sum + getPlanPrice(sub.planId), 0)
  }, [subscriptions])

  const activeCount = React.useMemo(() => {
    return subscriptions.filter((sub) => sub.status === 'active').length
  }, [subscriptions])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Subscriptions</p>
              <p className="text-xl font-semibold text-black">{subscriptions.length}</p>
            </div>
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Active Subscriptions</p>
              <p className="text-xl font-semibold text-black">{activeCount}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Monthly Revenue</p>
              <p className="text-xl font-semibold text-black">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 text-xs font-semibold">$</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

