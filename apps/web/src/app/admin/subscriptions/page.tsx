'use client'

import React from 'react'
import { UserCheck, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Billing } from '@/types/billing'

// Sample subscriptions data - TODO: Replace with API call
const sampleSubscriptions: Billing[] = [
  {
    id: '1',
    userId: '3',
    plan: 'premium',
    amount: 59,
    status: 'active',
    nextBillingDate: '2024-12-20T00:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    userId: '5',
    plan: 'basic',
    amount: 29,
    status: 'active',
    nextBillingDate: '2024-12-18T00:00:00Z',
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: '3',
    userId: '6',
    plan: 'premium',
    amount: 59,
    status: 'active',
    nextBillingDate: '2024-12-25T00:00:00Z',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    userId: '7',
    plan: 'enterprise',
    amount: 199,
    status: 'active',
    nextBillingDate: '2024-12-30T00:00:00Z',
    createdAt: '2024-03-25T11:45:00Z',
  },
  {
    id: '5',
    userId: '8',
    plan: 'basic',
    amount: 29,
    status: 'cancelled',
    nextBillingDate: '2024-12-15T00:00:00Z',
    createdAt: '2024-04-05T16:20:00Z',
  },
  {
    id: '6',
    userId: '9',
    plan: 'premium',
    amount: 59,
    status: 'expired',
    nextBillingDate: '2024-11-30T00:00:00Z',
    createdAt: '2024-04-12T08:30:00Z',
  },
]

// User names mapping - TODO: Get from API
const userNames: Record<string, string> = {
  '3': 'Sarah Smith',
  '5': 'Mary Johnson',
  '6': 'David Brown',
  '7': 'Robert Wilson',
  '8': 'Emily Davis',
  '9': 'Michael Taylor',
}

export default function AdminUserSubscriptionsPage() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [subscriptions] = React.useState<Billing[]>(sampleSubscriptions)

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const userName = userNames[sub.userId] || ''
    return (
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'cancelled':
        return 'secondary'
      case 'expired':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default'
      case 'premium':
        return 'secondary'
      case 'basic':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-black">User Subscriptions</h1>
        <p className="text-xs text-gray-600 mt-1">View and manage all user subscriptions and plans</p>
      </div>

      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-sm font-semibold text-black">
              All Subscriptions ({filteredSubscriptions.length})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search subscriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-9 text-xs border-gray-200"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-xs font-semibold text-black">User</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Plan</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Next Billing</TableHead>
                  <TableHead className="text-xs font-semibold text-black">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-gray-500">
                      No subscriptions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} className="border-gray-200">
                      <TableCell className="text-xs text-black font-medium">
                        {userNames[subscription.userId] || `User ${subscription.userId}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPlanColor(subscription.plan)} className="text-xs capitalize">
                          {subscription.plan}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-black font-medium">
                        {formatCurrency(subscription.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(subscription.status)} className="text-xs capitalize">
                          {subscription.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {formatDate(subscription.nextBillingDate)}
                      </TableCell>
                      <TableCell className="text-xs text-gray-600">
                        {formatDate(subscription.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
