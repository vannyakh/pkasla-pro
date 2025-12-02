'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  PaymentLogEventType,
  PaymentMethod,
  PaymentType,
  PaymentStatus,
} from '@/hooks/api/usePaymentLog'

interface PaymentLogToolbarProps {
  searchTerm: string
  paymentMethodFilter: string
  paymentTypeFilter: string
  eventTypeFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onPaymentMethodFilterChange: (value: string) => void
  onPaymentTypeFilterChange: (value: string) => void
  onEventTypeFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

const PAYMENT_METHODS: PaymentMethod[] = ['stripe', 'bakong']
const PAYMENT_TYPES: PaymentType[] = ['subscription', 'template']
const EVENT_TYPES: PaymentLogEventType[] = [
  'payment_created',
  'payment_intent_created',
  'payment_succeeded',
  'payment_failed',
  'payment_expired',
  'payment_cancelled',
  'webhook_received',
  'webhook_processed',
  'webhook_failed',
  'transaction_status_checked',
]
const STATUSES: PaymentStatus[] = ['pending', 'completed', 'failed', 'expired', 'cancelled']

export function PaymentLogToolbar({
  searchTerm,
  paymentMethodFilter,
  paymentTypeFilter,
  eventTypeFilter,
  statusFilter,
  onSearchChange,
  onPaymentMethodFilterChange,
  onPaymentTypeFilterChange,
  onEventTypeFilterChange,
  onStatusFilterChange,
}: PaymentLogToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by transaction ID, user ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-xs"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={paymentMethodFilter} onValueChange={onPaymentMethodFilterChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="All Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            {PAYMENT_METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={paymentTypeFilter} onValueChange={onPaymentTypeFilterChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {PAYMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={eventTypeFilter} onValueChange={onEventTypeFilterChange}>
          <SelectTrigger className="w-[180px] h-9 text-xs">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {EVENT_TYPES.map((eventType) => (
              <SelectItem key={eventType} value={eventType}>
                {eventType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

