'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { PaymentLogTable } from '@/components/admin/payment-logs/PaymentLogTable'
import { PaymentLogToolbar } from '@/components/admin/payment-logs/PaymentLogToolbar'
import { PaymentLogDialog } from '@/components/admin/payment-logs/PaymentLogDialog'
import { PaymentLogStats } from '@/components/admin/payment-logs/PaymentLogStats'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import {
  usePaymentLogs,
  usePaymentLogStats,
  type PaymentLog,
  type PaymentLogEventType,
  type PaymentMethod,
  type PaymentType,
  type PaymentStatus,
} from '@/hooks/api/usePaymentLog'

const ITEMS_PER_PAGE = 20

export default function AdminPaymentLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>('all')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<PaymentLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: {
      page: number
      limit: number
      paymentMethod?: PaymentMethod
      paymentType?: PaymentType
      eventType?: PaymentLogEventType
      status?: PaymentStatus
      search?: string
    } = {
      page: currentPage,
      limit: ITEMS_PER_PAGE,
    }

    if (paymentMethodFilter !== 'all') {
      apiFilters.paymentMethod = paymentMethodFilter as PaymentMethod
    }

    if (paymentTypeFilter !== 'all') {
      apiFilters.paymentType = paymentTypeFilter as PaymentType
    }

    if (eventTypeFilter !== 'all') {
      apiFilters.eventType = eventTypeFilter as PaymentLogEventType
    }

    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter as PaymentStatus
    }

    if (searchTerm) {
      apiFilters.search = searchTerm
    }

    return apiFilters
  }, [currentPage, paymentMethodFilter, paymentTypeFilter, eventTypeFilter, statusFilter, searchTerm])

  // Fetch payment logs and stats from API
  const { data: logsData, isLoading } = usePaymentLogs(filters)
  const { data: stats, isLoading: statsLoading } = usePaymentLogStats(filters)

  const logs = logsData?.items || []
  const totalItems = logsData?.total || 0
  const totalPages = logsData?.totalPages || 0
  const startIndex = logsData ? (logsData.page - 1) * logsData.limit : 0

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handlePaymentMethodFilterChange = (value: string) => {
    setPaymentMethodFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handlePaymentTypeFilterChange = (value: string) => {
    setPaymentTypeFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleEventTypeFilterChange = (value: string) => {
    setEventTypeFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleViewDetails = (log: PaymentLog) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  if (isLoading && !logsData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">Loading payment logs...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">Payment Logs</h1>
        <p className="text-xs text-gray-600 mt-1">
          Monitor and track all payment transactions and events
        </p>
      </div>

      {/* Statistics */}
      {stats && !statsLoading && <PaymentLogStats stats={stats} />}

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <PaymentLogToolbar
            searchTerm={searchTerm}
            paymentMethodFilter={paymentMethodFilter}
            paymentTypeFilter={paymentTypeFilter}
            eventTypeFilter={eventTypeFilter}
            statusFilter={statusFilter}
            onSearchChange={handleSearchChange}
            onPaymentMethodFilterChange={handlePaymentMethodFilterChange}
            onPaymentTypeFilterChange={handlePaymentTypeFilterChange}
            onEventTypeFilterChange={handleEventTypeFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
          />
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-gray-500 mb-4">No payment logs found</p>
            </div>
          ) : (
            <PaymentLogTable
              logs={logs}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={ITEMS_PER_PAGE}
              startIndex={startIndex}
              totalItems={totalItems}
              onPageChange={setCurrentPage}
              onViewDetails={handleViewDetails}
            />
          )}
        </CardContent>
      </Card>

      <PaymentLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
      />
    </div>
  )
}

