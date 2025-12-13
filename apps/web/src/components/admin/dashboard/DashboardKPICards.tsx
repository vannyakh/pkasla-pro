'use client'

import React from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'
import { Spinner } from '@/components/ui/shadcn-io/spinner'

interface KPIData {
  label: string
  value: string
  icon: LucideIcon
  trend?: number
  trendValue?: string
}

interface DashboardKPICardsProps {
  kpiData: KPIData[]
  isLoading?: boolean
}

export function DashboardKPICards({ kpiData, isLoading = false }: DashboardKPICardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border border-gray-200 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-center h-20">
                <Spinner />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => {
        const Icon = kpi.icon
        const trend = kpi.trend ?? (index === 0 ? 10.2 : index === 1 ? 20.2 : index === 2 ? -14.2 : 12.6)
        const trendValue = kpi.trendValue ?? (index === 0 ? '+1,454' : index === 1 ? '+1,589' : index === 2 ? '-89' : '+48')
        const isPositive = trend >= 0
        const TrendIcon = isPositive ? TrendingUp : TrendingDown

        return (
          <Card key={index} className="border p-0 border-gray-200 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 mb-2">{kpi.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-black mb-2">{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    <TrendIcon
                      className={`h-3.5 w-3.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                    />
                    <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                      <span className="ml-1">{trendValue} today</span>
                    </span>
                  </div>
                  <Link
                    href="/admin/users"
                    className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2 group"
                  >
                    View Report
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

