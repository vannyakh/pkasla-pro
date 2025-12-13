'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CreditCard, TrendingUp, Activity } from 'lucide-react'
import type { PaymentLogStats } from '@/hooks/api/usePaymentLog'

interface BillingOverviewCardsProps {
  stats: PaymentLogStats
  isLoading?: boolean
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function BillingOverviewCards({ stats, isLoading = false }: BillingOverviewCardsProps) {
  const completedCount = stats.byStatus['completed'] || 0
  const totalTransactions = stats.total

  return (
    <div className="grid grid-cols-1 md:grid-cols-2  lg:grid-cols-4 gap-4 mb-6">
      {/* Total Revenue */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="text-2xl font-bold text-black">{formatAmount(stats.totalAmount)}</div>
          <p className="text-xs text-gray-500 mt-1">All completed transactions</p>
        </CardContent>
      </Card>

      {/* Total Transactions */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="text-2xl font-bold text-black">{totalTransactions.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">All payment logs</p>
        </CardContent>
      </Card>

      {/* Successful Payments */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Successful Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="text-2xl font-bold text-black">{completedCount.toLocaleString()}</div>
          <p className="text-xs text-gray-500 mt-1">
            {totalTransactions > 0 
              ? `${((completedCount / totalTransactions) * 100).toFixed(1)}% success rate`
              : 'No transactions yet'}
          </p>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">Payment Methods</CardTitle>
            <CreditCard className="h-4 w-4 text-indigo-600" />
          </div>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="space-y-1">
            {Object.entries(stats.byPaymentMethod).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-xs text-gray-600 capitalize">{method}</span>
                <span className="text-sm font-semibold text-black">{count}</span>
              </div>
            ))}
            {Object.keys(stats.byPaymentMethod).length === 0 && (
              <p className="text-xs text-gray-400">No data</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
