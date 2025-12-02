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
import type { PaymentLog } from '@/hooks/api/usePaymentLog'

interface PaymentLogDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: PaymentLog | null
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

export function PaymentLogDialog({ open, onOpenChange, log }: PaymentLogDialogProps) {
  if (!log) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payment Log Details</DialogTitle>
          <DialogDescription>View detailed information about this payment log entry</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700">Event Type</label>
              <div className="mt-1">
                <Badge className={getEventTypeColor(log.eventType)}>
                  {log.eventType.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
              </div>
            </div>
          </div>

          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4">
            {log.transactionId && (
              <div>
                <label className="text-xs font-semibold text-gray-700">Transaction ID</label>
                <p className="text-sm text-gray-900 mt-1 font-mono">{log.transactionId}</p>
              </div>
            )}
            {log.paymentMethod && (
              <div>
                <label className="text-xs font-semibold text-gray-700">Payment Method</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{log.paymentMethod}</p>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-2 gap-4">
            {log.amount !== undefined && (
              <div>
                <label className="text-xs font-semibold text-gray-700">Amount</label>
                <p className="text-sm text-gray-900 mt-1 font-medium">
                  {formatAmount(log.amount, log.currency)}
                </p>
              </div>
            )}
            {log.paymentType && (
              <div>
                <label className="text-xs font-semibold text-gray-700">Payment Type</label>
                <p className="text-sm text-gray-900 mt-1 capitalize">{log.paymentType}</p>
              </div>
            )}
          </div>

          {/* Resource Info */}
          {(log.planId || log.planId_populated) && (
            <div>
              <label className="text-xs font-semibold text-gray-700">Plan</label>
              <p className="text-sm text-gray-900 mt-1">
                {log.planId_populated?.displayName || log.planId}
                {log.planId_populated?.price && (
                  <span className="text-gray-500 ml-2">
                    ({formatAmount(log.planId_populated.price, log.currency)})
                  </span>
                )}
              </p>
            </div>
          )}

          {(log.templateId || log.templateId_populated) && (
            <div>
              <label className="text-xs font-semibold text-gray-700">Template</label>
              <p className="text-sm text-gray-900 mt-1">
                {log.templateId_populated?.title || log.templateId}
                {log.templateId_populated?.price && (
                  <span className="text-gray-500 ml-2">
                    ({formatAmount(log.templateId_populated.price, log.currency)})
                  </span>
                )}
              </p>
            </div>
          )}

          {/* User Info */}
          {(log.userId || log.userId_populated) && (
            <div className="grid grid-cols-2 gap-4">
              {log.userId_populated?.name && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">User Name</label>
                  <p className="text-sm text-gray-900 mt-1">{log.userId_populated.name}</p>
                </div>
              )}
              {log.userId_populated?.email && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">User Email</label>
                  <p className="text-sm text-gray-900 mt-1">{log.userId_populated.email}</p>
                </div>
              )}
              {log.userId && !log.userId_populated && (
                <div>
                  <label className="text-xs font-semibold text-gray-700">User ID</label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{log.userId}</p>
                </div>
              )}
            </div>
          )}

          {/* Error Info */}
          {log.error && (
            <div>
              <label className="text-xs font-semibold text-gray-700">Error</label>
              <p className="text-sm text-red-600 mt-1">{log.error}</p>
            </div>
          )}

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

