'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Settings, User, Eye, Edit, Trash2, MapPin, Calendar, Users, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import CountdownTimer from '@/components/CountdownTimer'
import { Event } from '@/types/event'
import { useDeleteEvent } from '@/hooks/api/useEvent'

interface EventCardProps {
  event: Event
}

// Memoized formatting functions
const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDateTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (status) {
    case 'published':
      return 'default'
    case 'draft':
      return 'secondary'
    case 'completed':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

const DEFAULT_EVENT_IMAGE = 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=800&q=80'

export const EventCard = React.memo(function EventCard({ event }: EventCardProps) {
  const deleteEvent = useDeleteEvent()

  // Memoize computed values
  const eventImage = useMemo(
    () => event.coverImage || DEFAULT_EVENT_IMAGE,
    [event.coverImage]
  )

  const eventDate = useMemo(() => {
    return typeof event.date === 'string' ? event.date : event.date.toISOString()
  }, [event.date])

  const formattedDate = useMemo(() => formatDate(event.date), [event.date])
  const formattedTime = useMemo(() => formatTime(event.date), [event.date])
  const formattedCreatedAt = useMemo(() => formatDateTime(event.createdAt), [event.createdAt])
  const statusColor = useMemo(() => getStatusColor(event.status), [event.status])

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent.mutateAsync(event.id)
    }
  }

  return (
    <Card className="relative overflow-hidden p-0 border-0">
      {/* Background Image */}
      <div
        className="relative h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${eventImage})` }}
      >
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

        {/* Countdown Timer and Event Title - Centered Column */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Countdown Timer */}
            <div className="w-full flex justify-center">
              <CountdownTimer targetDate={eventDate} variant="relative" />
            </div>
            
            {/* Event Title */}
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold mb-1 drop-shadow-lg">{event.title}</h3>
              <p className="text-white/90 text-xs drop-shadow">
                {formattedDate} at {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 bg-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-pink-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-black truncate">{event.description || event.title}</h4>
              <Badge variant={statusColor} className="text-xs shrink-0 capitalize">
                {event.status}
              </Badge>
            </div>
            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3" />
                <span>ចំនួនភ្ញៀវ {event.guestCount} នាក់</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                <span>Created: {formattedCreatedAt}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/events/${event.id}`} className="flex-1">
            <Button variant="outline" className="w-full text-xs h-8 border-gray-300 hover:bg-gray-50" size="sm">
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View
            </Button>
          </Link>
          <Link href={`/dashboard/events/${event.id}/edit`} className="flex-1">
            <Button variant="outline" className="w-full text-xs h-8 border-gray-300 hover:bg-gray-50" size="sm">
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-xs h-8 border-gray-300 hover:bg-gray-50 px-2" size="sm">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-xs">
                <Settings className="h-3.5 w-3.5 mr-2" />
                Manage
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-xs text-red-600" 
                onClick={handleDelete} 
                disabled={deleteEvent.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                {deleteEvent.isPending ? 'Deleting...' : 'Delete'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
})

