'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface DonutDataItem {
  name: string
  value: number
  color: string
  [key: string]: any
}

interface UserStatusDonutChartProps {
  data: DonutDataItem[]
  isLoading?: boolean
}

export function UserStatusDonutChart({ data, isLoading = false }: UserStatusDonutChartProps) {
  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-black">User Status Distribution</CardTitle>
          <Link
            href="/admin/analytics"
            className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 group"
          >
            View Report
            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="h-[200px] md:h-[250px] w-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>
        {data.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-3 md:mt-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-1.5 md:gap-2">
                <div
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

