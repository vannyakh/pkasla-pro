'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'
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
import type { PaymentLog } from '@/hooks/api/usePaymentLog'

interface PaymentLogTableProps {
  logs: PaymentLog[]
  currentPage: number
  totalPages: number
  pageSize: number
  startIndex: number
  totalItems: number
  onPageChange: (page: number) => void
  onViewDetails?: (log: PaymentLog) => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAmount = (amount?: number, currency?: string) => {
  if (!amount) return 'N/A'
  const currencySymbol = currency === 'KHR' ? '៛' : currency === 'USD' || currency === 'usd' ? '$' : ''
  return `${currencySymbol}${amount.toLocaleString()} ${currency || ''}`
}

const getEventTypeColor = (eventType: string) => {
  switch (eventType) {
    case 'payment_succeeded':
      return 'bg-green-100 text-green-800'
    case 'payment_failed':
      return 'bg-red-100 text-red-800'
    case 'payment_created':
    case 'payment_intent_created':
      return 'bg-blue-100 text-blue-800'
    case 'payment_expired':
      return 'bg-orange-100 text-orange-800'
    case 'payment_cancelled':
      return 'bg-gray-100 text-gray-800'
    case 'webhook_received':
    case 'webhook_processed':
      return 'bg-purple-100 text-purple-800'
    case 'webhook_failed':
      return 'bg-red-100 text-red-800'
    case 'transaction_status_checked':
      return 'bg-cyan-100 text-cyan-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'expired':
      return 'bg-orange-100 text-orange-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPaymentMethodColor = (method?: string) => {
  switch (method) {
    case 'stripe':
      return 'bg-indigo-100 text-indigo-800'
    case 'bakong':
      return 'bg-teal-100 text-teal-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function PaymentLogTable({
  logs,
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  totalItems,
  onPageChange,
  onViewDetails,
}: PaymentLogTableProps) {
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1
  const endIndex = Math.min(startIndex + logs.length, totalItems)

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-xs font-semibold text-black">No</TableHead>
              <TableHead className="text-xs font-semibold text-black">Timestamp</TableHead>
              <TableHead className="text-xs font-semibold text-black">Transaction ID</TableHead>
              <TableHead className="text-xs font-semibold text-black">Event Type</TableHead>
              <TableHead className="text-xs font-semibold text-black">Status</TableHead>
              <TableHead className="text-xs font-semibold text-black">Payment Method</TableHead>
              <TableHead className="text-xs font-semibold text-black">Type</TableHead>
              <TableHead className="text-xs font-semibold text-black">Amount</TableHead>
              <TableHead className="text-xs font-semibold text-black">User</TableHead>
              <TableHead className="text-xs font-semibold text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-xs text-gray-500">
                  No payment logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log, index) => (
                <TableRow key={log.id} className="border-gray-200">
                  <TableCell className="text-xs text-black font-medium">
                    {startIndex + index + 1}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 font-mono">
                    {log.transactionId ? (
                      <span className="truncate max-w-[120px] block" title={log.transactionId}>
                        {log.transactionId}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getEventTypeColor(log.eventType)}>
                      {log.eventType.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.paymentMethod ? (
                      <Badge className={getPaymentMethodColor(log.paymentMethod)}>
                        {log.paymentMethod}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.paymentType ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        {log.paymentType}
                      </Badge>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 font-medium">
                    {formatAmount(log.amount, log.currency)}
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    {log.userId_populated ? (
                      <div className="flex flex-col">
                        {log.userId_populated.name && (
                          <span className="font-medium text-black">{log.userId_populated.name}</span>
                        )}
                        {log.userId_populated.email && (
                          <span className="text-gray-500">{log.userId_populated.email}</span>
                        )}
                      </div>
                    ) : log.userId ? (
                      <span className="text-gray-400 font-mono text-[10px]">{log.userId}</span>
                    ) : (
                      <span className="text-gray-400">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {onViewDetails && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(log)}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <div className="text-xs text-gray-600">
            Showing {startIndex + 1} to {endIndex} of {totalItems} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!hasPrevPage}
              className="h-8 px-3 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!hasNextPage}
              className="h-8 px-3 text-xs"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

