'use client'

import React from 'react'
import Link from 'next/link'
import { Users, Settings, CreditCard, MessageSquare, ShoppingCart, UserCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell, BarChart, Bar, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminPage() {
  // KPI Data
  const kpiData = [
    { label: 'New Visits', value: '102,400', icon: Users, color: 'text-teal-500' },
    { label: 'Messages', value: '81,212', icon: MessageSquare, color: 'text-blue-500' },
    { label: 'Purchases', value: '9,280', icon: CreditCard, color: 'text-red-500' },
    { label: 'Shoppings', value: '13,600', icon: ShoppingCart, color: 'text-teal-500' },
  ]

  // Line Chart Data (Expected vs Actual)
  const lineChartData = [
    { day: 'Mon', expected: 100, actual: 120 },
    { day: 'Tue', expected: 120, actual: 85 },
    { day: 'Wed', expected: 160, actual: 140 },
    { day: 'Thu', expected: 150, actual: 150 },
    { day: 'Fri', expected: 110, actual: 130 },
    { day: 'Sat', expected: 140, actual: 100 },
    { day: 'Sun', expected: 160, actual: 105 },
  ]

  const lineChartConfig = {
    expected: {
      label: 'Expected',
      color: 'hsl(var(--chart-1))',
    },
    actual: {
      label: 'Actual',
      color: 'hsl(var(--chart-2))',
    },
  }

  // Radar Chart Data
  const radarData = [
    { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
    { subject: 'Marketing', A: 98, B: 130, fullMark: 150 },
    { subject: 'Development', A: 86, B: 130, fullMark: 150 },
    { subject: 'IT', A: 99, B: 100, fullMark: 150 },
    { subject: 'Administration', A: 85, B: 90, fullMark: 150 },
  ]

  const radarConfig = {
    A: { label: 'Current', color: 'hsl(var(--chart-1))' },
    B: { label: 'Target', color: 'hsl(var(--chart-2))' },
  }

  // Donut Chart Data
  const donutData = [
    { name: 'Industries', value: 400, color: 'hsl(var(--chart-1))' },
    { name: 'Forex', value: 300, color: 'hsl(var(--chart-2))' },
    { name: 'Gold', value: 200, color: 'hsl(var(--chart-3))' },
    { name: 'Forecasts', value: 100, color: 'hsl(var(--chart-4))' },
  ]

  // Bar Chart Data
  const barChartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 800 },
    { name: 'Apr', value: 1000 },
    { name: 'May', value: 1200 },
    { name: 'Jun', value: 900 },
  ]

  const barChartConfig = {
    value: {
      label: 'Value',
      color: 'hsl(var(--chart-1))',
    },
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">Dashboard</h1>
        <p className="text-xs text-gray-600 mt-1">Overview of system statistics and management</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index} className="border border-gray-200">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 mb-1 truncate">{kpi.label}</p>
                    <p className="text-base md:text-lg font-semibold text-black truncate">{kpi.value}</p>
                  </div>
                  <Icon className={`h-6 w-6 md:h-8 md:w-8 shrink-0 ml-2 ${kpi.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Line Chart */}
      <Card className="mb-4 md:mb-6 border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-black">Expected vs Actual</CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                  <XAxis 
                    dataKey="day" 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10 }}
                    className="text-xs"
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 10 }}
                    className="text-xs"
                    width={40}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="expected" 
                    stroke="hsl(var(--chart-1))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Expected"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="hsl(var(--chart-2))" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Actual"
                  />
                </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {/* Radar Chart */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-black">Performance Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                    <PolarGrid className="stroke-gray-200" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fontSize: 9 }}
                      className="text-xs"
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 150]}
                      tick={{ fontSize: 9 }}
                      className="text-xs"
                    />
                    <Radar 
                      name="Current" 
                      dataKey="A" 
                      stroke="hsl(var(--chart-1))" 
                      fill="hsl(var(--chart-1))" 
                      fillOpacity={0.6}
                    />
                    <Radar 
                      name="Target" 
                      dataKey="B" 
                      stroke="hsl(var(--chart-2))" 
                      fill="hsl(var(--chart-2))" 
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart */}
        <Card className="border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-black">Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-3 md:mt-4">
              {donutData.map((item, index) => (
                <div key={index} className="flex items-center gap-1.5 md:gap-2">
                  <div 
                    className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="border border-gray-200 md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-black">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                      className="text-xs"
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                      className="text-xs"
                      width={40}
                    />
                    <Tooltip />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--chart-1))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Cards */}
      <div className="mt-4 md:mt-6">
        <h2 className="text-base md:text-lg font-semibold text-black mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-semibold text-black">User Management</CardTitle>
              </div>
              <CardDescription className="text-xs">View and manage all users</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/users">
                <Button variant="outline" className="w-full text-xs h-8" size="sm">
                  Manage Users
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-semibold text-black">User Subscriptions</CardTitle>
              </div>
              <CardDescription className="text-xs">Manage user subscriptions and plans</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/user_subscrip">
                <Button variant="outline" className="w-full text-xs h-8" size="sm">
                  View Subscriptions
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-4 w-4 text-black" />
                <CardTitle className="text-sm font-semibold text-black">System Settings</CardTitle>
              </div>
              <CardDescription className="text-xs">Configure system settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/settings">
                <Button variant="outline" className="w-full text-xs h-8" size="sm">
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
