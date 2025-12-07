'use client'

import React, { useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EventCard } from '@/components/events/EventCard'
import { useMyEvents, useDeleteEvent, useUpdateEvent } from '@/hooks/api/useEvent'
import { useRouter } from 'next/navigation'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { Event } from '@/types/event'
import EventDeleteModal from '@/components/events/EventDeleteModal'
import toast from 'react-hot-toast'

export default function EventPage() {
  const router = useRouter()
  const { data: events, isLoading, error } = useMyEvents()
  const deleteEvent = useDeleteEvent()
  const updateEvent = useUpdateEvent()
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean
    event: Event | null
  }>({ isOpen: false, event: null })

  const handleCreateEvent = () => {
    router.push('/dashboard/events/new')
  }

  const handleShare = useCallback(async (event: Event) => {
    const eventUrl = `${window.location.origin}/dashboard/events/${event.id}`
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title}`,
          url: eventUrl,
        })
      } else {
        await navigator.clipboard.writeText(eventUrl)
        toast.success('Event link copied to clipboard')
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(eventUrl)
          toast.success('Event link copied to clipboard')
        } catch {
          toast.error('Failed to copy event link')
        }
      }
    }
  }, [])

  const handleDuplicate = useCallback((event: Event) => {
    router.push(`/dashboard/events/new?duplicate=${event.id}`)
    toast.success('Opening event editor to duplicate...')
  }, [router])

  const handleToggleStatus = useCallback(async (event: Event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published'
    try {
      await updateEvent.mutateAsync({
        id: event.id,
        data: { status: newStatus },
      })
      toast.success(`Event ${newStatus === 'published' ? 'published' : 'moved to draft'}`)
    } catch {
      toast.error('Failed to update event status')
    }
  }, [updateEvent])

  const handleViewQR = useCallback((event: Event) => {
    router.push(`/dashboard/events/${event.id}?tab=qr`)
  }, [router])

  const handleViewPublic = useCallback((event: Event) => {
    window.open(`/events/${event.id}`, '_blank')
  }, [])

  const handleDeleteClick = useCallback((event: Event) => {
    setDeleteModalState({ isOpen: true, event })
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteModalState.event) return
    
    try {
      await deleteEvent.mutateAsync(deleteModalState.event.id)
      toast.success('Event deleted successfully')
      setDeleteModalState({ isOpen: false, event: null })
    } catch {
      toast.error('Failed to delete event')
    }
  }, [deleteModalState.event, deleteEvent])

  const handleManageEvent = useCallback((event: Event) => {
    router.push(`/dashboard/events/${event.id}`)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner variant="default" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600">Failed to load events: {error.message}</p>
      </div>
    )
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

      {!events || events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-gray-600">No events found. Create your first event!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onShare={() => handleShare(event)}
              onDuplicate={() => handleDuplicate(event)}
              onToggleStatus={() => handleToggleStatus(event)}
              onViewQR={() => handleViewQR(event)}
              onViewPublic={() => handleViewPublic(event)}
              onDelete={() => handleDeleteClick(event)}
              onManage={() => handleManageEvent(event)}
              isDeleting={deleteEvent.isPending}
              isUpdating={updateEvent.isPending}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <EventDeleteModal
        event={deleteModalState.event}
        open={deleteModalState.isOpen}
        onOpenChange={(open) => setDeleteModalState(open 
          ? { isOpen: true, event: deleteModalState.event } 
          : { isOpen: false, event: null }
        )}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteEvent.isPending}
      />
    </div>
  )
}
