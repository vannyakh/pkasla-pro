'use client'

import React, { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Plus, Mail, Loader2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGuests } from '@/hooks/api/useGuest'
import { useMyEvents } from '@/hooks/api/useEvent'
import GuestDrawer from '@/components/guests/CreateGuestDrawer'
import Empty from '@/components/Empty'
import type { Guest, GuestStatus } from '@/types/guest'
import type { User } from '@/types/user'
import PageLoading from '@/components/PageLoading'

export default function GuestPage() {
  const { data: session } = useSession()
  const user = session?.user as User | undefined

  // State for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // State for drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)

  // Fetch user's events for the filter dropdown
  const { data: events = [], isLoading: eventsLoading } = useMyEvents()

  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: {
      userId?: string
      eventId?: string
      status?: GuestStatus
      search?: string
      page: number
      pageSize: number
    } = {
      page,
      pageSize,
    }

    // Filter by current user
    if (user?.id) {
      apiFilters.userId = user.id
    }

    // Filter by event
    if (selectedEventId && selectedEventId !== 'all') {
      apiFilters.eventId = selectedEventId
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      apiFilters.status = selectedStatus as GuestStatus
    }

    // Search query
    if (searchQuery.trim()) {
      apiFilters.search = searchQuery.trim()
    }

    return apiFilters
  }, [user, selectedEventId, selectedStatus, searchQuery, page, pageSize])

  // Fetch guests with filters
  const { data: guestsData, isLoading: guestsLoading, error: guestsError } = useGuests(filters)

  // Extract guests and pagination info
  const guests = guestsData?.items || []
  const total = guestsData?.total || 0
  const totalPages = Math.ceil(total / pageSize)

  // Helper function to get event name
  const getEventName = (eventId: Guest['eventId']): string => {
    if (typeof eventId === 'string') {
      const event = events.find((e) => e.id === eventId)
      return event?.title || 'Unknown Event'
    }
    if (eventId && typeof eventId === 'object' && 'title' in eventId) {
      return eventId.title
    }
    return 'Unknown Event'
  }

  // Helper function to get status badge variant
  const getStatusBadge = (status: GuestStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
            Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case 'declined':
        return (
          <Badge variant="default" className="bg-red-100 text-red-700 hover:bg-red-100">
            Declined
          </Badge>
        )
      default:
        return (
          <Badge variant="default" className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {status}
          </Badge>
        )
    }
  }

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle create guest
  const handleCreateGuest = () => {
    setEditingGuest(null)
    setIsDrawerOpen(true)
  }

  // Handle edit guest
  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest)
    setIsDrawerOpen(true)
  }

  // Handle drawer success (refresh data)
  const handleDrawerSuccess = () => {
    // Data will be automatically refreshed by React Query
    setIsDrawerOpen(false)
    setEditingGuest(null)
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Guests</h1>
          <p className="text-gray-600 mt-2">Manage your guest list and RSVPs</p>
        </div>
        <Button onClick={handleCreateGuest}>
          <Plus className="h-4 w-4 mr-2" />
          Add Guest
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guests..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1) // Reset to first page on search
            }}
          />
        </div>
        <Select
          value={selectedEventId}
          onValueChange={(value) => {
            setSelectedEventId(value)
            setPage(1) // Reset to first page on filter change
          }}
          disabled={eventsLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedStatus}
          onValueChange={(value) => {
            setSelectedStatus(value)
            setPage(1) // Reset to first page on filter change
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Guest List */}
      <Card>
        <CardContent className="p-0">
          {guestsLoading ? (
            <div className="flex items-center justify-center py-12">
             <PageLoading size='sm' fullScreen={false} text='Loading guests...' />
             </div>
          ) : guestsError ? (
            <Empty
              title="Error loading guests"
              description={`Error loading guests: ${guestsError.message}`}
              animationUrl="/anim/error.lottie"
              size="default"
              action={undefined}
              padding="none"
            />
          ) : guests.length === 0 ? (
            <Empty
              title={searchQuery || selectedEventId !== 'all' || selectedStatus !== 'all' 
                ? 'No guests found' 
                : 'No guests yet'}
              description={
                searchQuery || selectedEventId !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your search or filters to find guests.'
                  : 'Start by adding your first guest to manage your event invitations.'
              }
              animationUrl="/anim/list.lottie"
              size="default"
              action={
                !searchQuery && selectedEventId === 'all' && selectedStatus === 'all'
                  ? {
                      label: 'Add Guest',
                      onClick: handleCreateGuest,
                      icon: <Plus className="mr-2 h-4 w-4" />,
                    }
                  : undefined
              }
              padding="none"
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guests.map((guest) => (
                    <TableRow key={guest.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                            {getInitials(guest.name)}
                          </div>
                          <div>
                            <div className="font-medium">{guest.name}</div>
                            {guest.phone && (
                              <div className="text-sm text-muted-foreground">{guest.phone}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {guest.email || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getEventName(guest.eventId)}
                      </TableCell>
                      <TableCell>{getStatusBadge(guest.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditGuest(guest)}
                            title="Edit guest"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {guest.email && (
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`mailto:${guest.email}`} title="Send email">
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{' '}
                    {total} guests
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Guest Drawer */}
      <GuestDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        guest={editingGuest}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  )
}
