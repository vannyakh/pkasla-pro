'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PaymentLogStats as PaymentLogStatsType } from '@/hooks/api/usePaymentLog'

interface PaymentLogStatsProps {
  stats: PaymentLogStatsType
}

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function PaymentLogStats({ stats }: PaymentLogStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Logs */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Total Logs</CardTitle>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="text-2xl font-bold text-black">{stats.total.toLocaleString()}</div>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="text-2xl font-bold text-green-600">
            {formatAmount(stats.totalAmount)}
          </div>
        </CardContent>
      </Card>

      {/* By Status */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">By Status</CardTitle>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="space-y-2">
            {Object.entries(stats.byStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <Badge
                  className={
                    status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : status === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {status}
                </Badge>
                <span className="text-sm font-medium text-black">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Payment Method */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">By Payment Method</CardTitle>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="space-y-2">
            {Object.entries(stats.byPaymentMethod).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <Badge
                  className={
                    method === 'stripe'
                      ? 'bg-indigo-100 text-indigo-800'
                      : method === 'bakong'
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {method}
                </Badge>
                <span className="text-sm font-medium text-black">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Payment Type */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">By Payment Type</CardTitle>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="space-y-2">
            {Object.entries(stats.byPaymentType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800">{type}</Badge>
                <span className="text-sm font-medium text-black">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* By Event Type */}
      <Card className="border  gap-0 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700">By Event Type</CardTitle>
        </CardHeader>
        <CardContent className='py-0'>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(stats.byEventType).map(([eventType, count]) => (
              <div key={eventType} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  {eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
                <span className="text-sm font-medium text-black">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

