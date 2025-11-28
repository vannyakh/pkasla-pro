'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionsSummary } from '@/components/admin/subscriptions/SubscriptionsSummary'
import { SubscriptionsTable } from '@/components/admin/subscriptions/SubscriptionsTable'
import { SubscriptionsFilters } from '@/components/admin/subscriptions/SubscriptionsFilters'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useAllUserSubscriptions } from '@/hooks/api/useUserSubscription'
import type { UserSubscription } from '@/types/user-subscription'

const ITEMS_PER_PAGE = 10

export default function AdminUserSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch subscriptions from API
  const statusQuery = statusFilter !== 'all' ? statusFilter : undefined
  const { data: subscriptions = [], isLoading } = useAllUserSubscriptions(statusQuery)

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Get user name/email
      const userId = typeof sub.userId === 'object' ? sub.userId.id || '' : sub.userId
      const userName = typeof sub.userId === 'object' 
        ? (sub.userId.name || sub.userId.email || '')
        : ''
      const userEmail = typeof sub.userId === 'object' ? sub.userId.email || '' : ''

      // Get plan name
      const planName = typeof sub.planId === 'object' 
        ? (sub.planId.displayName || sub.planId.name || '')
        : ''

      const matchesSearch =
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userId.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
      
      const matchesPlan = planFilter === 'all' || 
        (typeof sub.planId === 'object' && 
         (sub.planId.name?.toLowerCase() === planFilter.toLowerCase() ||
          sub.planId.displayName?.toLowerCase() === planFilter.toLowerCase()))

      return matchesSearch && matchesStatus && matchesPlan
    })
  }, [subscriptions, searchTerm, statusFilter, planFilter])

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex)

  // Get unique plan names for filter
  const availablePlans = useMemo(() => {
    const plans = new Set<string>()
    subscriptions.forEach((sub) => {
      if (typeof sub.planId === 'object') {
        plans.add(sub.planId.name || sub.planId.displayName || '')
      }
    })
    return Array.from(plans).filter(Boolean)
  }, [subscriptions])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">Loading subscriptions...</span>
      </div>
    )
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
            
            <SubscriptionsFilters
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              planFilter={planFilter}
              availablePlans={availablePlans}
              onSearchChange={handleSearchChange}
              onStatusFilterChange={handleStatusFilterChange}
              onPlanFilterChange={handlePlanFilterChange}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SubscriptionsTable
            subscriptions={paginatedSubscriptions}
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
