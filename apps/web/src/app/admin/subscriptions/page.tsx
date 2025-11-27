'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Billing } from '@/types/billing'
import { SubscriptionsSummary } from '@/components/admin/subscriptions/SubscriptionsSummary'
import { SubscriptionsTable } from '@/components/admin/subscriptions/SubscriptionsTable'
import { SubscriptionsFilters } from '@/components/admin/subscriptions/SubscriptionsFilters'

// Sample subscriptions data - TODO: Replace with API call
const sampleSubscriptions: Billing[] = [
  {
    id: '1',
    userId: '3',
    plan: 'premium',
    amount: 59,
    status: 'active',
    nextBillingDate: '2024-12-20T00:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: '5',
    plan: 'basic',
    amount: 29,
    status: 'active',
    nextBillingDate: '2024-12-18T00:00:00Z',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    userId: '6',
    plan: 'premium',
    amount: 59,
    status: 'active',
    nextBillingDate: '2024-12-25T00:00:00Z',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    userId: '7',
    plan: 'enterprise',
    amount: 199,
    status: 'active',
    nextBillingDate: '2024-12-30T00:00:00Z',
    createdAt: '2024-03-25T11:45:00Z',
  },
  {
    id: '5',
    userId: '8',
    plan: 'basic',
    amount: 29,
    status: 'cancelled',
    nextBillingDate: '2024-12-15T00:00:00Z',
    createdAt: '2024-04-05T16:20:00Z',
  },
  {
    id: '6',
    userId: '9',
    plan: 'premium',
    amount: 59,
    status: 'expired',
    nextBillingDate: '2024-11-30T00:00:00Z',
    createdAt: '2024-04-12T08:30:00Z',
  },
  {
    id: '7',
    userId: '10',
    plan: 'enterprise',
    amount: 199,
    status: 'active',
    nextBillingDate: '2025-01-05T00:00:00Z',
    createdAt: '2024-05-01T10:20:00Z',
  },
  {
    id: '8',
    userId: '11',
    plan: 'basic',
    amount: 29,
    status: 'active',
    nextBillingDate: '2024-12-22T00:00:00Z',
    createdAt: '2024-05-15T14:10:00Z',
  },
  {
    id: '9',
    userId: '12',
    plan: 'premium',
    amount: 59,
    status: 'cancelled',
    nextBillingDate: '2024-12-10T00:00:00Z',
    createdAt: '2024-06-01T09:00:00Z',
  },
  {
    id: '10',
    userId: '13',
    plan: 'enterprise',
    amount: 199,
    status: 'active',
    nextBillingDate: '2025-01-10T00:00:00Z',
    createdAt: '2024-06-20T11:30:00Z',
  },
]

// User names mapping - TODO: Get from API
const userNames: Record<string, string> = {
  '3': 'Sarah Smith',
  '5': 'Mary Johnson',
  '6': 'David Brown',
  '7': 'Robert Wilson',
  '8': 'Emily Davis',
  '9': 'Michael Taylor',
  '10': 'Jennifer Martinez',
  '11': 'James Anderson',
  '12': 'Lisa Thompson',
  '13': 'Christopher Lee',
}

const ITEMS_PER_PAGE = 10

export default function AdminUserSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const subscriptions = useMemo(() => sampleSubscriptions, [])

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const userName = userNames[sub.userId] || ''
      const matchesSearch =
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
      const matchesPlan = planFilter === 'all' || sub.plan === planFilter

      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [subscriptions, searchTerm, statusFilter, planFilter])

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  // Handler functions that reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handlePlanFilterChange = (value: string) => {
    setPlanFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">User Subscriptions</h1>
        <p className="text-xs text-gray-600 mt-1">
          View and manage all user subscriptions and billing transactions
        </p>
      </div>

      <SubscriptionsSummary subscriptions={filteredSubscriptions} />

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-sm font-semibold text-black">
              All Subscriptions ({filteredSubscriptions.length})
            </CardTitle>
            <SubscriptionsFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              planFilter={planFilter}
              onSearchChange={handleSearchChange}
              onStatusFilterChange={handleStatusFilterChange}
              onPlanFilterChange={handlePlanFilterChange}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SubscriptionsTable
            subscriptions={paginatedSubscriptions}
            userNames={userNames}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={ITEMS_PER_PAGE}
            startIndex={startIndex}
            totalItems={filteredSubscriptions.length}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
