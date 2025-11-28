'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX, UserLock } from 'lucide-react'
import type { UserMetrics } from '@/types/analytics'

interface UserMetricsCardProps {
  metrics: UserMetrics
}

export function UserMetricsCard({ metrics }: UserMetricsCardProps) {
  const statusItems = [
    {
      label: 'Active',
      value: metrics.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pending',
      value: metrics.pending,
      icon: UserLock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Suspended',
      value: metrics.suspended,
      icon: UserX,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <CardTitle className="text-sm font-semibold text-black">User Metrics</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Total Users</p>
            <p className="text-lg font-semibold text-black">{metrics.total}</p>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-200">
            {statusItems.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full ${item.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <p className="text-xs text-gray-600">{item.label}</p>
                  <p className="text-base font-semibold text-black">{item.value}</p>
                </div>
              )
            })}
          </div>
          {Object.keys(metrics.byRole).length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">By Role</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(metrics.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                    <span className="font-medium capitalize">{role}:</span>
                    <span className="text-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

