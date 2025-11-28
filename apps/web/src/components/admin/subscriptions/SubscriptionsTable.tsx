'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { UserSubscription } from '@/types/user-subscription'
import type { SubscriptionPlan } from '@/types/subscription-plan'

interface SubscriptionsTableProps {
  subscriptions: UserSubscription[]
  currentPage: number
  totalPages: number
  pageSize: number
  startIndex: number
  totalItems: number
  onPageChange: (page: number) => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (amount: number) => {
  return `$${amount.toFixed(2)}`
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'cancelled':
      return 'secondary'
    case 'expired':
      return 'destructive'
    case 'pending':
      return 'outline'
    default:
      return 'secondary'
  }
}

const getPlanName = (planId: string | SubscriptionPlan): string => {
  if (typeof planId === 'object' && planId !== null) {
    return planId.displayName || planId.name || 'Unknown'
  }
  return 'Unknown'
}

const getPlanPrice = (planId: string | SubscriptionPlan): number => {
  if (typeof planId === 'object' && planId !== null) {
    return planId.price || 0
  }
  return 0
}

const getUserName = (userId: string | { id?: string; name?: string; email?: string }): string => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.name || userId.email || 'Unknown User'
  }
  return `User ${userId}`
}

const getUserEmail = (userId: string | { id?: string; name?: string; email?: string }): string | undefined => {
  if (typeof userId === 'object' && userId !== null) {
    return userId.email
  }
  return undefined
}

export function SubscriptionsTable({
  subscriptions,
  currentPage,
  totalPages,
  startIndex,
  totalItems,
  onPageChange,
}: SubscriptionsTableProps) {
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const endIndex = Math.min(startIndex + subscriptions.length, totalItems)

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-xs font-semibold text-black">No</TableHead>
              <TableHead className="text-xs font-semibold text-black">User</TableHead>
              <TableHead className="text-xs font-semibold text-black">Plan</TableHead>
              <TableHead className="text-xs font-semibold text-black">Price</TableHead>
              <TableHead className="text-xs font-semibold text-black">Status</TableHead>
              <TableHead className="text-xs font-semibold text-black">Start Date</TableHead>
              <TableHead className="text-xs font-semibold text-black">End Date</TableHead>
              <TableHead className="text-xs font-semibold text-black">Auto Renew</TableHead>
              <TableHead className="text-xs font-semibold text-black">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-xs text-gray-500">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription, index) => {
                const userName = getUserName(subscription.userId)
                const userEmail = getUserEmail(subscription.userId)
                const planName = getPlanName(subscription.planId)
                const planPrice = getPlanPrice(subscription.planId)

                return (
                  <TableRow key={subscription.id} className="border-gray-200">
                    <TableCell className="text-xs text-black font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="text-black font-medium">{userName}</span>
                        {userEmail && (
                          <span className="text-gray-500 text-[10px]">{userEmail}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {planName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-black font-medium">
                      {formatCurrency(planPrice)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusColor(subscription.status)}
                        className="text-xs capitalize"
                      >
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {formatDate(subscription.startDate)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {formatDate(subscription.endDate)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {subscription.autoRenew ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                          Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {formatDate(subscription.createdAt)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
      {totalItems > 0 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {totalItems} subscriptions
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={!hasPrevPage}
              className="h-8 text-xs"
            >
              <ChevronLeft className="h-3 w-3" />
              Previous
            </Button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={!hasNextPage}
              className="h-8 text-xs"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

