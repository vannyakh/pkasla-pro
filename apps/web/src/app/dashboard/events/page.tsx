'use client'

import React from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/events/EventCard'
import { useMyEvents } from '@/hooks/api/useEvent'
import { useRouter } from 'next/navigation'

export default function EventPage() {
  const router = useRouter()
  const { data: events, isLoading, error } = useMyEvents()

  const handleCreateEvent = () => {
    router.push('/dashboard/events/new')
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-black">Events</h1>
          <p className="text-xs text-gray-600 mt-0.5">Manage your events</p>
        </div>
        <Button 
          size="sm" 
          className="text-xs" 
          onClick={handleCreateEvent}
        >
              <Plus className="h-3 w-3 mr-1.5" />
              Create Event
            </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {error && (
        <div className="text-center py-12">
          <p className="text-sm text-red-600">Failed to load events: {error.message}</p>
        </div>
      )}

      {!isLoading && !error && (!events || events.length === 0) && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600">No events found. Create your first event!</p>
        </div>
      )}

      {!isLoading && !error && events && events.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      )}
    </div>
  )
}
