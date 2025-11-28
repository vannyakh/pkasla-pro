'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { RevenueCards } from '@/components/admin/analytics/RevenueCard'
import { RevenuePeriodCard } from '@/components/admin/analytics/RevenuePeriodCard'
import { SubscriptionStatsCard } from '@/components/admin/analytics/SubscriptionStatsCard'
import { UserMetricsCard } from '@/components/admin/analytics/UserMetricsCard'
import { useRevenueStats, useSiteMetrics, useUserMetrics } from '@/hooks/api/useAnalytics'
import { BarChart3, TrendingUp } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const { data: revenueStats, isLoading: isLoadingRevenue } = useRevenueStats()
  const { data: siteMetrics, isLoading: isLoadingSite } = useSiteMetrics()
  const { data: userMetrics, isLoading: isLoadingUsers } = useUserMetrics()

  const isLoading = isLoadingRevenue || isLoadingSite || isLoadingUsers

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-gray-600" />
          <h1 className="text-xl md:text-2xl font-semibold text-black">Analytics Dashboard</h1>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          Comprehensive analytics and insights for your platform
        </p>
      </div>

      {/* Revenue Overview */}
      {revenueStats && (
        <div className="space-y-6 mb-6">
          <RevenueCards stats={revenueStats} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenuePeriodCard stats={revenueStats.revenueByPeriod} />
            <SubscriptionStatsCard stats={revenueStats.activeSubscriptions} />
          </div>
        </div>
      )}

      {/* Template Purchases Summary */}
      {revenueStats && (
        <Card className="border border-gray-200 mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <CardTitle className="text-sm font-semibold text-black">Template Purchases</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Purchases</p>
                <p className="text-2xl font-semibold text-black">{revenueStats.templatePurchases.count}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-semibold text-black">
                  ${revenueStats.templatePurchases.revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {siteMetrics && (
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                <CardTitle className="text-sm font-semibold text-black">Site Metrics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">Total Users</p>
                  <p className="text-lg font-semibold text-black">{siteMetrics.totalUsers}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-600">Active Users</p>
                  <p className="text-lg font-semibold text-black">{siteMetrics.activeUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {userMetrics && <UserMetricsCard metrics={userMetrics} />}
      </div>
    </div>
  )
}
