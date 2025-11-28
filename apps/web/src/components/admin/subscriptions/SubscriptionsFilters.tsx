'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SubscriptionsFiltersProps {
  searchTerm: string
  statusFilter: string
  planFilter: string
  availablePlans?: string[]
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onPlanFilterChange: (value: string) => void
}

export function SubscriptionsFilters({
  searchTerm,
  statusFilter,
  planFilter,
  availablePlans = [],
  onSearchChange,
  onStatusFilterChange,
  onPlanFilterChange,
}: SubscriptionsFiltersProps) {
  return (
    <div className="flex flex-row items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={onPlanFilterChange}>
          <SelectTrigger className="w-full sm:w-40 h-9 text-xs">
            <SelectValue placeholder="Filter by plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {availablePlans.map((plan) => (
              <SelectItem key={plan} value={plan.toLowerCase()}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-xs border-gray-200"
          />
        </div>
      </div>
      
    </div>
  )
}

