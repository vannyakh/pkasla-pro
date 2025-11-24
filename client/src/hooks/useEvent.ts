import { useState, useEffect } from 'react'
import { Event, CreateEventDto, UpdateEventDto } from '@/types/event'

export function useEvent() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/event')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events)
      } else {
        setError('Failed to fetch events')
      }
    } catch (err) {
      setError('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (eventData: CreateEventDto) => {
    try {
      const response = await fetch('/api/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        const data = await response.json()
        setEvents([...events, data.event])
        return { success: true, event: data.event }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to create event' }
    }
  }

  const updateEvent = async (id: string, eventData: UpdateEventDto) => {
    try {
      const response = await fetch(`/api/event/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      })

      if (response.ok) {
        const data = await response.json()
        setEvents(events.map(e => e.id === id ? data.event : e))
        return { success: true, event: data.event }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to update event' }
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/event/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setEvents(events.filter(e => e.id !== id))
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete event' }
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent
  }
}

