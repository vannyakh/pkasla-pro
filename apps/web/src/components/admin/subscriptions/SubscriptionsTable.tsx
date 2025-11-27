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
import { Billing } from '@/types/billing'

interface SubscriptionsTableProps {
  subscriptions: Billing[]
  userNames: Record<string, string>
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
    default:
      return 'secondary'
  }
}

const getPlanColor = (plan: string) => {
  switch (plan) {
    case 'enterprise':
      return 'default'
    case 'premium':
      return 'secondary'
    case 'basic':
      return 'outline'
    default:
      return 'outline'
  }
}

export function SubscriptionsTable({
  subscriptions,
  userNames,
  currentPage,
  totalPages,
  pageSize,
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
              <TableHead className="text-xs font-semibold text-black">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-black">Status</TableHead>
              <TableHead className="text-xs font-semibold text-black">Next Billing</TableHead>
              <TableHead className="text-xs font-semibold text-black">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-xs text-gray-500">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription, index) => (
                <TableRow key={subscription.id} className="border-gray-200">
                  <TableCell className="text-xs text-black font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-xs text-black font-medium">
                    {userNames[subscription.userId] || `User ${subscription.userId}`}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getPlanColor(subscription.plan)}
                      className="text-xs capitalize"
                    >
                      {subscription.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-black font-medium">
                    {formatCurrency(subscription.amount)}
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
                    {formatDate(subscription.nextBillingDate)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatDate(subscription.createdAt)}
                  </TableCell>
                </TableRow>
              ))
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

