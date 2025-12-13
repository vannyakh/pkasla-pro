'use client'

import React, { useMemo } from 'react'
import { Users, MessageSquare, ShoppingCart, UserCheck } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboardMetrics, useUserMetrics } from '@/hooks/api/useAdmin'
import {
  DashboardHeader,
  DashboardKPICards,
  UserGrowthChart,
  UserRolesRadarChart,
  UserStatusDonutChart,
  UsersByRoleBarChart,
  QuickActionsCards,
} from '@/components/admin/dashboard'

export default function AdminPage() {
  const { data: dashboardMetrics, isLoading: isLoadingDashboard, error: dashboardError } = useDashboardMetrics()
  const { data: userMetrics, isLoading: isLoadingUsers, error: userMetricsError } = useUserMetrics()

  // KPI Data from API
  const kpiData = useMemo(() => {
    if (!dashboardMetrics && !userMetrics) return []
    
    return [
      { 
        label: 'Total Users', 
        value: dashboardMetrics?.totalUsers?.toLocaleString() || '0', 
        icon: Users, 
        color: 'text-teal-500' 
      },
      { 
        label: 'Active Users', 
        value: dashboardMetrics?.activeUsers?.toLocaleString() || '0', 
        icon: UserCheck, 
        color: 'text-blue-500' 
      },
      { 
        label: 'Pending Users', 
        value: userMetrics?.pending?.toLocaleString() || '0', 
        icon: MessageSquare, 
        color: 'text-yellow-500' 
      },
      { 
        label: 'Suspended Users', 
        value: userMetrics?.suspended?.toLocaleString() || '0', 
        icon: ShoppingCart, 
        color: 'text-red-500' 
      },
    ]
  }, [dashboardMetrics, userMetrics])

  // Line Chart Data (User Growth - using user metrics)
  const lineChartData = useMemo(() => {
    if (!userMetrics) return []
    // Generate last 7 days data based on user metrics
    const total = userMetrics.total || 0
    const active = userMetrics.active || 0
    const baseValue = Math.max(total, 100)
    
    return [
      { day: 'Mon', expected: Math.round(baseValue * 0.9), actual: Math.round(active * 0.95) },
      { day: 'Tue', expected: Math.round(baseValue * 0.95), actual: Math.round(active * 0.98) },
      { day: 'Wed', expected: baseValue, actual: active },
      { day: 'Thu', expected: Math.round(baseValue * 1.05), actual: Math.round(active * 1.02) },
      { day: 'Fri', expected: Math.round(baseValue * 1.1), actual: Math.round(active * 1.05) },
      { day: 'Sat', expected: Math.round(baseValue * 1.05), actual: Math.round(active * 1.03) },
      { day: 'Sun', expected: baseValue, actual: active },
    ]
  }, [userMetrics])

  // Radar Chart Data (User Roles Performance)
  const radarData = useMemo(() => {
    if (!userMetrics?.byRole) return []
    
    const roles = userMetrics.byRole
    const maxValue = Math.max(...Object.values(roles), 100)
    
    return [
      { subject: 'Admin', A: roles.admin || 0, B: Math.round(maxValue * 0.8), fullMark: maxValue },
      { subject: 'Recruiter', A: roles.recruiter || 0, B: Math.round(maxValue * 0.9), fullMark: maxValue },
      { subject: 'Candidate', A: roles.candidate || 0, B: Math.round(maxValue * 0.7), fullMark: maxValue },
      { subject: 'User', A: roles.user || 0, B: Math.round(maxValue * 0.6), fullMark: maxValue },
    ]
  }, [userMetrics])

  // Donut Chart Data (User Status Distribution)
  const donutData = useMemo(() => {
    if (!userMetrics) return []
    
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
    ]
    
    return [
      { name: 'Active', value: userMetrics.active || 0, color: colors[0] },
      { name: 'Pending', value: userMetrics.pending || 0, color: colors[1] },
      { name: 'Suspended', value: userMetrics.suspended || 0, color: colors[2] },
    ].filter(item => item.value > 0)
  }, [userMetrics])

  // Bar Chart Data (User Roles)
  const barChartData = useMemo(() => {
    if (!userMetrics?.byRole) return []
    
    return Object.entries(userMetrics.byRole).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [userMetrics])

  const isLoading = isLoadingDashboard || isLoadingUsers
  const hasError = dashboardError || userMetricsError

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="border border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600 text-center">
              Failed to load dashboard data. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <DashboardHeader />

      <DashboardKPICards kpiData={kpiData} isLoading={isLoading} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserRolesRadarChart data={radarData} isLoading={isLoading} />
        <UserStatusDonutChart data={donutData} isLoading={isLoading} />
        <UsersByRoleBarChart data={barChartData} isLoading={isLoading} />
      </div>
      <UserGrowthChart data={lineChartData} isLoading={isLoading} />
      <QuickActionsCards />
    </div>
  )
}
