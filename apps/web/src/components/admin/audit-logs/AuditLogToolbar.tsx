'use client'

import React from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AuditLogAction, AuditLogStatus } from '@/hooks/api/useAuditLog'

interface AuditLogToolbarProps {
  searchTerm: string
  actionFilter: string
  resourceFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onActionFilterChange: (value: string) => void
  onResourceFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

const ACTIONS: AuditLogAction[] = [
  'create',
  'update',
  'delete',
  'login',
  'logout',
  'view',
  'export',
  'import',
  'approve',
  'reject',
  'publish',
  'unpublish',
  'payment',
  'subscription',
  'other',
]

const RESOURCES = [
  'user',
  'event',
  'template',
  'payment',
  'subscription',
  'guest',
  'invitation',
  'feedback',
  'upload',
  'settings',
]

const STATUSES: AuditLogStatus[] = ['success', 'failure', 'pending']

export function AuditLogToolbar({
  searchTerm,
  actionFilter,
  resourceFilter,
  statusFilter,
  onSearchChange,
  onActionFilterChange,
  onResourceFilterChange,
  onStatusFilterChange,
}: AuditLogToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by description, user, email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-xs"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={actionFilter} onValueChange={onActionFilterChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ACTIONS.map((action) => (
              <SelectItem key={action} value={action}>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={resourceFilter} onValueChange={onResourceFilterChange}>
          <SelectTrigger className="w-[140px] h-9 text-xs">
            <SelectValue placeholder="All Resources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Resources</SelectItem>
            {RESOURCES.map((resource) => (
              <SelectItem key={resource} value={resource}>
                {resource.charAt(0).toUpperCase() + resource.slice(1)}
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

