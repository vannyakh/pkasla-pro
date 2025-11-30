'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ArrowRight, DollarSign, ShoppingCart, CreditCard, Users } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatNumber, calculateTrend, formatTrendValue } from '@/helpers/analytics'

interface RevenueCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  description?: string
  trend?: number
  trendValue?: number | string
  showViewReport?: boolean
  viewReportLink?: string
  formatAsCurrency?: boolean // If true, format as currency; if false, format as number
}

export function RevenueCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  showViewReport = true,
  viewReportLink = '#',
  formatAsCurrency = true, // Default to currency formatting
}: RevenueCardProps) {
  const isPositive = trend !== undefined ? trend >= 0 : true
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  // Format value based on formatAsCurrency prop
  const formattedValue = typeof value === 'number' 
    ? (formatAsCurrency ? formatCurrency(value) : formatNumber(value))
    : value

  return (
    <Card className="border border-gray-200 p-0 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl md:text-3xl font-bold text-black mb-2">
              {formattedValue}
            </p>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mb-2">
                <TrendIcon
                  className={`h-3.5 w-3.5 ${isPositive ? 'text-green-600' : 'text-red-600'}`}
                />
                <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                  {trendValue && (
                    <span className="ml-1">
                      {typeof trendValue === 'number' ? formatCurrency(trendValue) : trendValue} today
                    </span>
                  )}
                </span>
              </div>
            )}
            {showViewReport && (
              <Link
                href={viewReportLink}
                className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2 group"
              >
                View Report
                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {description && !showViewReport && (
              <p className="text-xs text-gray-500 mt-2">{description}</p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function RevenueCards({ stats }: { stats: any }) {
  // Calculate trends based on revenueByPeriod data
  // Compare today with average of rest of week (thisWeek - today) / 6 days
  const revenueByPeriod = stats.revenueByPeriod || {}
  const todayRevenue = revenueByPeriod.today || 0
  const thisWeekRevenue = revenueByPeriod.thisWeek || 0
  const thisMonthRevenue = revenueByPeriod.thisMonth || 0
  
  // Calculate average daily revenue for the week (excluding today)
  const weekAverage = thisWeekRevenue > todayRevenue 
    ? (thisWeekRevenue - todayRevenue) / 6 
    : 0
  
  // Calculate average daily revenue for the month (excluding this week)
  const monthAverage = thisMonthRevenue > thisWeekRevenue
    ? (thisMonthRevenue - thisWeekRevenue) / (30 - 7) // Approximate days in month minus week
    : 0
  
  // Calculate trend for Total Sales (today vs week average, or week vs month average)
  let salesTrend = 0
  let salesTrendValue = 0
  
  if (weekAverage > 0) {
    // Compare today with week average
    salesTrend = calculateTrend(todayRevenue, weekAverage)
    salesTrendValue = todayRevenue - weekAverage
  } else if (monthAverage > 0) {
    // Fallback: compare week average with month average
    salesTrend = calculateTrend(weekAverage, monthAverage)
    salesTrendValue = weekAverage - monthAverage
  } else if (todayRevenue > 0) {
    // If no historical data, show positive trend
    salesTrend = 100
    salesTrendValue = todayRevenue
  }

  // For Total Orders, we compare current count with a simple estimate
  // Since we don't have historical order data, we'll show a neutral trend or calculate based on revenue
  const totalOrders = (stats.templatePurchases?.count || 0) + (stats.activeSubscriptions?.count || 0)
  // Estimate orders trend based on revenue trend (simplified)
  const ordersTrend = salesTrend !== 0 ? salesTrend * 0.8 : undefined // Rough correlation
  const ordersTrendValue = ordersTrend !== undefined 
    ? Math.round(totalOrders * (ordersTrend / 100))
    : undefined

  // For Total Visitors, we don't have trend data from API, so we'll show no trend or calculate based on available data
  const totalVisitors = stats.siteMetrics?.totalUsers || 0
  // Since we don't have visitor trend data, we'll set it to undefined to hide the trend
  const visitorsTrend = undefined
  const visitorsTrendValue = undefined

  // Refunded - no data available, set to 0
  const refundedTrend = undefined
  const refundedTrendValue = undefined

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RevenueCard
        title="Total Sales"
        value={stats.totalRevenue || 0}
        icon={<DollarSign className="h-5 w-5 text-gray-600" />}
        trend={salesTrend}
        trendValue={formatTrendValue(salesTrendValue, true)}
        showViewReport={true}
        formatAsCurrency={true}
      />
      <RevenueCard
        title="Total Orders"
        value={totalOrders}
        icon={<ShoppingCart className="h-5 w-5 text-gray-600" />}
        trend={ordersTrend}
        trendValue={ordersTrendValue !== undefined ? formatTrendValue(ordersTrendValue, false) : undefined}
        showViewReport={true}
        formatAsCurrency={false}
      />
      <RevenueCard
        title="Total Visitors"
        value={totalVisitors}
        icon={<Users className="h-5 w-5 text-gray-600" />}
        trend={visitorsTrend}
        trendValue={visitorsTrendValue}
        showViewReport={true}
        formatAsCurrency={false}
      />
      <RevenueCard
        title="Refunded"
        value={0}
        icon={<CreditCard className="h-5 w-5 text-gray-600" />}
        trend={refundedTrend}
        trendValue={refundedTrendValue}
        showViewReport={true}
        formatAsCurrency={true}
      />
    </div>
  )
}

