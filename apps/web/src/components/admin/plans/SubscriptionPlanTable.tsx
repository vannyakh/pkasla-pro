'use client'

import React from 'react'
import { Edit, Trash2, CheckCircle2, XCircle } from 'lucide-react'
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
import { SubscriptionPlan } from '@/types/subscription-plan'

interface SubscriptionPlanTableProps {
  plans: SubscriptionPlan[]
  onEdit: (plan: SubscriptionPlan) => void
  onDelete: (id: string) => void
  isDeleting?: boolean
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

const formatBillingCycle = (cycle: string) => {
  return cycle.charAt(0).toUpperCase() + cycle.slice(1)
}

const formatMaxEvents = (maxEvents: number | null) => {
  if (maxEvents === null) return 'Unlimited'
  return maxEvents.toString()
}

export function SubscriptionPlanTable({
  plans,
  onEdit,
  onDelete,
  isDeleting = false,
}: SubscriptionPlanTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200">
            <TableHead className="text-xs font-semibold text-black">Name</TableHead>
            <TableHead className="text-xs font-semibold text-black">Display Name</TableHead>
            <TableHead className="text-xs font-semibold text-black">Price</TableHead>
            <TableHead className="text-xs font-semibold text-black">Billing Cycle</TableHead>
            <TableHead className="text-xs font-semibold text-black">Max Events</TableHead>
            <TableHead className="text-xs font-semibold text-black">Features</TableHead>
            <TableHead className="text-xs font-semibold text-black">Status</TableHead>
            <TableHead className="text-xs font-semibold text-black">Created</TableHead>
            <TableHead className="text-xs font-semibold text-black">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-xs text-gray-500">
                No subscription plans found
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id} className="border-gray-200">
                <TableCell className="text-xs text-black font-medium">{plan.name}</TableCell>
                <TableCell className="text-xs text-black font-medium">{plan.displayName}</TableCell>
                <TableCell className="text-xs text-black font-medium">
                  {formatCurrency(plan.price)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {formatBillingCycle(plan.billingCycle)}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {formatMaxEvents(plan.maxEvents)}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {plan.features.length > 0 ? (
                    <span className="text-xs">{plan.features.length} features</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {plan.isActive ? (
                    <Badge variant="default" className="text-xs bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-gray-600">
                  {formatDate(plan.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(plan)}
                      className="h-7 w-7 p-0"
                      disabled={isDeleting}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(plan.id)}
                      className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

