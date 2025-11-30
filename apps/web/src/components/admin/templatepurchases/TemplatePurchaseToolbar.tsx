'use client'

import React from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TemplatePurchaseToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
}

export function TemplatePurchaseToolbar({
  searchTerm,
  onSearchChange,
  onClearSearch,
}: TemplatePurchaseToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by user name, email, or template name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8 h-9 text-xs border-gray-200"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

