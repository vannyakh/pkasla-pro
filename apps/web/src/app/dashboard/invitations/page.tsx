'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Check, X, Clock, Loader2, Eye } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  useInvitations, 
  useMyInvitations, 
  useUpdateInvitationStatus
} from '@/hooks/api/useInvitation'
import { useMyEvents } from '@/hooks/api/useEvent'
import Empty from '@/components/Empty'
import type { Invitation, InvitationStatus } from '@/types/invitation'
import type { User } from '@/types/user'
import PageLoading from '@/components/PageLoading'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function InvitationsPage() {
  const { data: session } = useSession()
  const user = session?.user as User | undefined
  const router = useRouter()

  // State for filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventId, setSelectedEventId] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [viewType, setViewType] = useState<'received' | 'sent'>('received')
  const [page, setPage] = useState(1)
  const pageSize = 10

  // State for action dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'decline' | 'view' | null>(null)

  // Fetch user's events for the filter dropdown
  const { data: events = [], isLoading: eventsLoading } = useMyEvents()

  // Build filters for API
  const filters = useMemo(() => {
    const apiFilters: {
      eventId?: string
      userId?: string
      status?: InvitationStatus
      page: number
      pageSize: number
    } = {
      page,
      pageSize,
    }

    // Filter by event
    if (selectedEventId && selectedEventId !== 'all') {
      apiFilters.eventId = selectedEventId
    }

    // Filter by status
    if (selectedStatus && selectedStatus !== 'all') {
      apiFilters.status = selectedStatus as InvitationStatus
    }

    // For "sent" view, filter by current user
    if (viewType === 'sent' && user?.id) {
      apiFilters.userId = user.id
    }

    return apiFilters
  }, [user, selectedEventId, selectedStatus, viewType, page, pageSize])

  // Fetch invitations - call both hooks unconditionally to follow Rules of Hooks
  const { data: myInvitationsData, isLoading: myInvitationsLoading, error: myInvitationsError } = 
    useMyInvitations(selectedEventId !== 'all' ? selectedEventId : undefined)
  const { data: receivedInvitationsData, isLoading: receivedInvitationsLoading, error: receivedInvitationsError } = 
    useInvitations(filters)
  
  // Use the appropriate data based on viewType
  const invitationsData = viewType === 'sent' ? myInvitationsData : receivedInvitationsData
  const invitationsLoading = viewType === 'sent' ? myInvitationsLoading : receivedInvitationsLoading
  const invitationsError = viewType === 'sent' ? myInvitationsError : receivedInvitationsError
  
  // Extract invitations and pagination info
  const invitations = useMemo(() => {
    if (viewType === 'sent') {
      let filtered = Array.isArray(invitationsData) ? invitationsData : []
      if (selectedStatus !== 'all') {
        filtered = filtered.filter((inv: Invitation) => inv.status === selectedStatus)
      }
      return filtered
    }
    // For received view, invitationsData is InvitationListResponse
    if (invitationsData && 'items' in invitationsData) {
      return invitationsData.items
    }
    return []
  }, [invitationsData, viewType, selectedStatus])

  const total = viewType === 'sent' 
    ? invitations.length 
    : (invitationsData && 'total' in invitationsData ? invitationsData.total : 0)
  const totalPages = Math.ceil(total / pageSize)

  // Mutations
  const updateStatusMutation = useUpdateInvitationStatus()

  // Helper function to get event name
  const getEventName = useCallback((eventId: Invitation['eventId']): string => {
    if (typeof eventId === 'object' && eventId) {
      return eventId.title || 'Unknown Event'
    }
    if (typeof eventId === 'string') {
      const event = events.find((e) => e.id === eventId)
      return event?.title || 'Unknown Event'
    }
    return 'Unknown Event'
  }, [events])

  // Helper function to get event ID
  const getEventId = (eventId: Invitation['eventId']): string => {
    if (typeof eventId === 'object' && eventId) {
      return eventId.id
    }
    return eventId || ''
  }

  // Helper function to get user info
  const getUserInfo = useCallback((userId: Invitation['userId']) => {
    if (typeof userId === 'object' && userId) {
      return {
        name: userId.name || 'Unknown User',
        email: userId.email || '',
        avatar: userId.avatar,
      }
    }
    return {
      name: 'Unknown User',
      email: '',
      avatar: undefined,
    }
  }, [])

  // Handle status update
  const handleStatusUpdate = async (invitation: Invitation, status: 'approved' | 'declined') => {
    try {
      await updateStatusMutation.mutateAsync({
        id: invitation.id,
        data: { status },
      })
      setActionDialogOpen(false)
      setSelectedInvitation(null)
    } catch {
      // Error is handled by the mutation
    }
  }

  // Handle view event
  const handleViewEvent = (invitation: Invitation) => {
    const eventId = getEventId(invitation.eventId)
    router.push(`/dashboard/events/${eventId}`)
  }

  // Open action dialog
  const openActionDialog = (invitation: Invitation, type: 'approve' | 'decline' | 'view') => {
    setSelectedInvitation(invitation)
    setActionType(type)
    setActionDialogOpen(true)
  }

  // Get status badge variant
  const getStatusBadge = (status: InvitationStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-xs"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="text-xs bg-green-500"><Check className="w-3 h-3 mr-1" />Approved</Badge>
      case 'declined':
        return <Badge variant="destructive" className="text-xs"><X className="w-3 h-3 mr-1" />Declined</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  // Filter invitations by search query
  const filteredInvitations = useMemo(() => {
    if (!searchQuery.trim()) return invitations

    const query = searchQuery.toLowerCase()
    return invitations.filter((invitation) => {
      const eventName = getEventName(invitation.eventId).toLowerCase()
      const userInfo = getUserInfo(invitation.userId)
      const userName = userInfo.name.toLowerCase()
      const userEmail = userInfo.email.toLowerCase()
      const message = invitation.message?.toLowerCase() || ''

      return (
        eventName.includes(query) ||
        userName.includes(query) ||
        userEmail.includes(query) ||
        message.includes(query)
      )
    })
  }, [invitations, searchQuery, getEventName, getUserInfo])

  if (invitationsLoading || eventsLoading) {
    return <PageLoading />
  }

  if (invitationsError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading invitations: {invitationsError.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invitation Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage invitation requests for your events
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className='p-0'>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* View Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewType === 'received' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewType('received')
                  setPage(1)
                }}
              >
                Received
              </Button>
              <Button
                variant={viewType === 'sent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setViewType('sent')
                  setPage(1)
                }}
              >
                Sent
              </Button>
            </div>

            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search invitations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Event Filter */}
            <Select value={selectedEventId} onValueChange={(value) => {
              setSelectedEventId(value)
              setPage(1)
            }}>
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

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={(value) => {
              setSelectedStatus(value)
              setPage(1)
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invitations Table */}
      {filteredInvitations.length === 0 ? (
        <Empty
          title="No invitations found"
          description={
            viewType === 'sent'
              ? "You haven't sent any invitation requests yet."
              : 'No invitation requests found for your events.'
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{viewType === 'sent' ? 'Event' : 'User'}</TableHead>
                  <TableHead>{viewType === 'sent' ? 'Host' : 'Event'}</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation: Invitation) => {
                  const userInfo = getUserInfo(invitation.userId)
                  const eventName = getEventName(invitation.eventId)

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        {viewType === 'sent' ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{eventName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {userInfo.avatar && (
                                <AvatarImage src={userInfo.avatar} alt={userInfo.name} />
                              )}
                              <AvatarFallback>
                                {userInfo.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{userInfo.name}</p>
                              {userInfo.email && (
                                <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {viewType === 'sent' ? (
                          <span className="text-sm text-muted-foreground">Event Host</span>
                        ) : (
                          <span className="font-medium">{eventName}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {invitation.message ? (
                            <p className="text-sm truncate" title={invitation.message}>
                              {invitation.message}
                            </p>
                          ) : (
                            <span className="text-sm text-muted-foreground">No message</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {viewType === 'received' && invitation.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(invitation, 'approve')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openActionDialog(invitation, 'decline')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewEvent(invitation)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} invitations
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
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

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Invitation'}
              {actionType === 'decline' && 'Decline Invitation'}
              {actionType === 'view' && 'View Event'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Are you sure you want to approve this invitation request? The user will be added as a guest to your event.'}
              {actionType === 'decline' && 'Are you sure you want to decline this invitation request?'}
              {actionType === 'view' && 'View the event details for this invitation.'}
            </DialogDescription>
          </DialogHeader>
          {selectedInvitation && (
            <div className="space-y-2 py-4">
              <div>
                <p className="text-sm font-medium">User:</p>
                <p className="text-sm text-muted-foreground">
                  {getUserInfo(selectedInvitation.userId).name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Event:</p>
                <p className="text-sm text-muted-foreground">
                  {getEventName(selectedInvitation.eventId)}
                </p>
              </div>
              {selectedInvitation.message && (
                <div>
                  <p className="text-sm font-medium">Message:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvitation.message}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionDialogOpen(false)
                setSelectedInvitation(null)
              }}
            >
              Cancel
            </Button>
            {actionType === 'approve' && selectedInvitation && (
              <Button
                onClick={() => handleStatusUpdate(selectedInvitation, 'approved')}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Approve
              </Button>
            )}
            {actionType === 'decline' && selectedInvitation && (
              <Button
                variant="destructive"
                onClick={() => handleStatusUpdate(selectedInvitation, 'declined')}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Decline
              </Button>
            )}
            {actionType === 'view' && selectedInvitation && (
              <Button
                onClick={() => {
                  handleViewEvent(selectedInvitation)
                  setActionDialogOpen(false)
                }}
              >
                View Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

