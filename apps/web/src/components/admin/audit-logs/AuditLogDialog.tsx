'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { AuditLog } from '@/hooks/api/useAuditLog'

interface AuditLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
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

export function AuditLogDialog({ open, onOpenChange, log }: AuditLogDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
          <DialogDescription>View detailed information about this audit log entry</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Action</label>
              <div className="mt-1">
                <Badge className={getActionColor(log.action)}>{log.action}</Badge>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
              </div>
            </div>
          </div>

          {/* Resource Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Resource</label>
              <p className="text-sm text-gray-900 mt-1">{log.resource}</p>
            </div>
            {log.resourceId && (
              <div>
                <label className="text-xs font-semibold text-gray-700">Resource ID</label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{log.resourceId}</p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-gray-700">Description</label>
            <p className="text-sm text-gray-900 mt-1">{log.description}</p>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            {log.userName && (
              <div>
                <label className="text-xs font-semibold text-gray-700">User Name</label>
                <p className="text-sm text-gray-900 mt-1">{log.userName}</p>
              </div>
            )}
            {log.userEmail && (
              <div>
                <label className="text-xs font-semibold text-gray-700">User Email</label>
                <p className="text-sm text-gray-900 mt-1">{log.userEmail}</p>
              </div>
            )}
            {log.userId && (
              <div>
                <label className="text-xs font-semibold text-gray-700">User ID</label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{log.userId}</p>
              </div>
            )}
          </div>

          {/* Request Info */}
          <div className="grid grid-cols-2 gap-4">
            {log.ipAddress && (
              <div>
                <label className="text-xs font-semibold text-gray-700">IP Address</label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{log.ipAddress}</p>
              </div>
            )}
            {log.userAgent && (
              <div>
                <label className="text-xs font-semibold text-gray-700">User Agent</label>
                <p className="text-xs text-gray-900 mt-1 break-all">{log.userAgent}</p>
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Created At</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(log.createdAt)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Updated At</label>
              <p className="text-sm text-gray-900 mt-1">{formatDate(log.updatedAt)}</p>
            </div>
          </div>

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-700">Metadata</label>
              <pre className="text-xs text-gray-900 mt-1 p-3 bg-gray-50 rounded border border-gray-200 overflow-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

