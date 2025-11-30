'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { AuditLogTable } from '@/components/admin/audit-logs/AuditLogTable'
import { AuditLogToolbar } from '@/components/admin/audit-logs/AuditLogToolbar'
import { AuditLogDialog } from '@/components/admin/audit-logs/AuditLogDialog'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useAuditLogs, type AuditLog, type AuditLogAction, type AuditLogStatus } from '@/hooks/api/useAuditLog'

const ITEMS_PER_PAGE = 20

export default function AdminAuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: {
      page: number
      pageSize: number
      action?: AuditLogAction
      resource?: string
      status?: AuditLogStatus
      search?: string
    } = {
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    }

    if (actionFilter !== 'all') {
      apiFilters.action = actionFilter as AuditLogAction
    }

    if (resourceFilter !== 'all') {
      apiFilters.resource = resourceFilter
    }

    if (statusFilter !== 'all') {
      apiFilters.status = statusFilter as AuditLogStatus
    }

    if (searchTerm) {
      apiFilters.search = searchTerm
    }

    return apiFilters
  }, [currentPage, actionFilter, resourceFilter, statusFilter, searchTerm])

  // Fetch audit logs from API
  const { data: logsData, isLoading } = useAuditLogs(filters)

  const logs = logsData?.items || []
  const totalItems = logsData?.total || 0
  const totalPages = logsData ? Math.ceil(logsData.total / logsData.pageSize) : 0
  const startIndex = logsData ? (logsData.page - 1) * logsData.pageSize : 0

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleResourceFilterChange = (value: string) => {
    setResourceFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    if (currentPage !== 1) setCurrentPage(1)
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
        <span className="ml-2 text-xs text-gray-600">Loading audit logs...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">Audit Logs</h1>
        <p className="text-xs text-gray-600 mt-1">
          Monitor and track all system activities and user actions
        </p>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <AuditLogToolbar
            searchTerm={searchTerm}
            actionFilter={actionFilter}
            resourceFilter={resourceFilter}
            statusFilter={statusFilter}
            onSearchChange={handleSearchChange}
            onActionFilterChange={handleActionFilterChange}
            onResourceFilterChange={handleResourceFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
          />
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-xs text-gray-500 mb-4">No audit logs found</p>
            </div>
          ) : (
            <AuditLogTable
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

      <AuditLogDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        log={selectedLog}
      />
    </div>
  )
}

