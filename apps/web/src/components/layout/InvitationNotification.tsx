'use client'

import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePendingInvitationsCount, useInvitations } from '@/hooks/api/useInvitation'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Invitation } from '@/types/invitation'

export default function InvitationNotification() {
  const router = useRouter()
  const { data: pendingCount = 0 } = usePendingInvitationsCount()
  const { data: invitationsData } = useInvitations({ 
    status: 'pending', 
    page: 1, 
    pageSize: 5 
  })

  const pendingInvitations = invitationsData?.items || []

  const handleViewAll = () => {
    router.push('/dashboard/invitations')
  }

  const handleViewEvent = (eventId: string) => {
    const id = typeof eventId === 'string' ? eventId : eventId
    router.push(`/dashboard/events/${id}`)
  }

  if (pendingCount === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Invitation notifications"
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingCount > 9 ? '9+' : pendingCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl shadow-lg border-gray-200 dark:border-gray-800 p-2">
        <DropdownMenuLabel className="px-3 py-2.5 rounded-lg flex items-center justify-between">
          <span>Invitation Requests</span>
          {pendingCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingCount}
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        {pendingInvitations.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground text-center">
            No pending invitations
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {pendingInvitations.map((invitation: Invitation) => {
              const event = typeof invitation.eventId === 'object' ? invitation.eventId : null
              const user = typeof invitation.userId === 'object' ? invitation.userId : null
              const eventId = typeof invitation.eventId === 'string' 
                ? invitation.eventId 
                : invitation.eventId?.id || ''

              return (
                <DropdownMenuItem
                  key={invitation.id}
                  className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5 flex flex-col items-start"
                  onClick={() => handleViewEvent(eventId)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-none truncate">
                        {user?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {event?.title || 'Event'}
                      </p>
                      {invitation.message && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {invitation.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(invitation.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>
        )}
        {pendingCount > 5 && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleViewAll}
              className="cursor-pointer rounded-lg px-3 py-2.5 my-0.5 text-center justify-center"
            >
              View all invitations ({pendingCount})
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

