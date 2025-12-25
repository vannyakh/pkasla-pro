'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { type ColumnDef } from '@tanstack/react-table'
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Eye,
  Loader2,
  PieChart
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { useMyEvents } from '@/hooks/api/useEvent'
import { useGifts } from '@/hooks/api/useGift'
import { useGuests } from '@/hooks/api/useGuest'
import type { Event } from '@/types/event'
import Empty from '@/components/Empty'
import { format } from 'date-fns'

interface EventFinancialData {
  id: string
  event: Event
  title: string
  date: string
  guestCount: number
  contributingGuests: number
  totalUsd: number
  totalKhr: number
  contributionRate: number
  status: string
}

function FinancialPage() {
  const router = useRouter()
  const { data: events = [], isLoading: eventsLoading } = useMyEvents()
  const { data: giftsData, isLoading: giftsLoading } = useGifts({})
  const { data: guestsData, isLoading: guestsLoading } = useGuests({})

  // Process event financial data
  const eventFinancialData = useMemo<EventFinancialData[]>(() => {
    if (!events.length) return []

    return events.map((event) => {
      const eventId = event.id
      
      // Filter gifts and guests for this event
      const eventGifts = (giftsData?.items || []).filter((gift) => {
        const giftEventId = typeof gift.eventId === 'string' ? gift.eventId : gift.eventId.id
        return giftEventId === eventId
      })
      
      const eventGuests = (guestsData?.items || []).filter((guest) => {
        const guestEventId = typeof guest.eventId === 'string' ? guest.eventId : guest.eventId.id
        return guestEventId === eventId
      })

      // Calculate totals
      const totalUsd = eventGifts
        .filter((g) => g.currency === 'usd')
        .reduce((sum, g) => sum + g.amount, 0)
      
      const totalKhr = eventGifts
        .filter((g) => g.currency === 'khr')
        .reduce((sum, g) => sum + g.amount, 0)

      const contributingGuests = eventGuests.filter((g) => g.hasGivenGift).length
      const guestCount = eventGuests.length
      const contributionRate = guestCount > 0 ? (contributingGuests / guestCount) * 100 : 0

      return {
        id: eventId,
        event,
        title: event.title,
        date: typeof event.date === 'string' ? event.date : event.date.toISOString(),
        guestCount,
        contributingGuests,
        totalUsd,
        totalKhr,
        contributionRate,
        status: event.status
      }
    })
  }, [events, giftsData, guestsData])

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalEvents = eventFinancialData.length
    const totalUsd = eventFinancialData.reduce((sum, e) => sum + e.totalUsd, 0)
    const totalKhr = eventFinancialData.reduce((sum, e) => sum + e.totalKhr, 0)
    const totalGuests = eventFinancialData.reduce((sum, e) => sum + e.guestCount, 0)
    const totalContributing = eventFinancialData.reduce((sum, e) => sum + e.contributingGuests, 0)
    const avgContributionRate = totalGuests > 0 ? (totalContributing / totalGuests) * 100 : 0

    // Calculate average per event
    const avgUsdPerEvent = totalEvents > 0 ? totalUsd / totalEvents : 0
    const avgKhrPerEvent = totalEvents > 0 ? totalKhr / totalEvents : 0

    return {
      totalEvents,
      totalUsd,
      totalKhr,
      totalGuests,
      totalContributing,
      avgContributionRate,
      avgUsdPerEvent,
      avgKhrPerEvent
    }
  }, [eventFinancialData])

  const formatCurrency = (amount: number, currency: 'USD' | 'KHR') => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString()}`
    }
    return `${amount.toLocaleString()} ៛`
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      published: { label: 'Active', variant: 'default' },
      draft: { label: 'Draft', variant: 'secondary' },
      completed: { label: 'Completed', variant: 'outline' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
    }
    
    const config = statusMap[status] || { label: status, variant: 'outline' }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const columns = useMemo<ColumnDef<EventFinancialData>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Event Name',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <p className="font-semibold text-sm">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(row.original.date), 'MMM dd, yyyy')}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'guestCount',
        header: 'Guests',
        cell: ({ row }) => (
          <div className="text-center">
            <p className="font-semibold text-sm">{row.original.contributingGuests}/{row.original.guestCount}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.contributionRate.toFixed(0)}% contributed
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'totalUsd',
        header: 'USD Total',
        cell: ({ row }) => (
          <p className="font-semibold text-sm text-green-600">
            {formatCurrency(row.original.totalUsd, 'USD')}
          </p>
        ),
      },
      {
        accessorKey: 'totalKhr',
        header: 'KHR Total',
        cell: ({ row }) => (
          <p className="font-semibold text-sm text-blue-600">
            {formatCurrency(row.original.totalKhr, 'KHR')}
          </p>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/financial/${row.original.id}`)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        ),
      },
    ],
    [router]
  )

  const isLoading = eventsLoading || giftsLoading || guestsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="space-y-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600 mt-2">Track and manage your event finances</p>
          </div>
        </div>
        
        <Empty
          title="No Events Yet"
          description="Create your first event to start tracking financial data and contributions."
          size="lg"
          animationUrl="/anim/upcomming.lottie"
          padding="lg"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-2">Track and manage your event finances</p>
        </div>
      </div>

      <DataTable
            columns={columns}
            data={eventFinancialData}
            searchKey="title"
            searchPlaceholder="Search events..."
            enableFiltering={true}
            enableSorting={true}
            enableColumnVisibility={false}
            enableExport={true}
            exportOptions={{
              filename: 'financial-report',
              formats: ['csv', 'json'],
            }}
            emptyMessage="No events with financial data"
          />

      
    </div>
  )
}

export default FinancialPage
