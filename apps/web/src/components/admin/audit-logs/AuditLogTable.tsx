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
import type { AuditLog } from '@/hooks/api/useAuditLog'

interface AuditLogTableProps {
  logs: AuditLog[]
  currentPage: number
  totalPages: number
  pageSize: number
  startIndex: number
  totalItems: number
  onPageChange: (page: number) => void
  onViewDetails?: (log: AuditLog) => void
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

const getActionColor = (action: string) => {
  switch (action) {
    case 'create':
      return 'bg-green-100 text-green-800'
    case 'update':
      return 'bg-blue-100 text-blue-800'
    case 'delete':
      return 'bg-red-100 text-red-800'
    case 'login':
      return 'bg-purple-100 text-purple-800'
    case 'logout':
      return 'bg-gray-100 text-gray-800'
    case 'payment':
      return 'bg-emerald-100 text-emerald-800'
    case 'subscription':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'failure':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function AuditLogTable({
  logs,
  currentPage,
  totalPages,
  pageSize,
  startIndex,
  totalItems,
  onPageChange,
  onViewDetails,
}: AuditLogTableProps) {
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
              <TableHead className="text-xs font-semibold text-black">User</TableHead>
              <TableHead className="text-xs font-semibold text-black">Action</TableHead>
              <TableHead className="text-xs font-semibold text-black">Resource</TableHead>
              <TableHead className="text-xs font-semibold text-black">Description</TableHead>
              <TableHead className="text-xs font-semibold text-black">Status</TableHead>
              <TableHead className="text-xs font-semibold text-black">IP Address</TableHead>
              <TableHead className="text-xs font-semibold text-black">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-xs text-gray-500">
                  No audit logs found
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
                  <TableCell className="text-xs text-gray-600">
                    <div className="flex flex-col">
                      {log.userName && (
                        <span className="font-medium text-black">{log.userName}</span>
                      )}
                      {log.userEmail && (
                        <span className="text-gray-500">{log.userEmail}</span>
                      )}
                      {!log.userName && !log.userEmail && (
                        <span className="text-gray-400">System</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionColor(log.action)}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600">
                    <div className="flex flex-col">
                      <span className="font-medium text-black">{log.resource}</span>
                      {log.resourceId && (
                        <span className="text-gray-400 text-[10px]">{log.resourceId}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-600 max-w-xs truncate">
                    {log.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(log.status)}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500 font-mono">
                    {log.ipAddress || 'N/A'}
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

