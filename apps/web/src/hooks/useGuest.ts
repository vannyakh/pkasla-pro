import { useState, useEffect } from 'react'
import { Guest, CreateGuestDto, UpdateGuestDto } from '@/types/guest'

export function useGuest(eventId?: string) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGuests()
  }, [eventId])

  const fetchGuests = async () => {
    try {
      setLoading(true)
      const url = eventId ? `/api/guest?eventId=${eventId}` : '/api/guest'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setGuests(data.guests)
      } else {
        setError('Failed to fetch guests')
      }
    } catch (err) {
      setError('Failed to fetch guests')
    } finally {
      setLoading(false)
    }
  }

  const createGuest = async (guestData: CreateGuestDto) => {
    try {
      const response = await fetch('/api/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData)
      })

      if (response.ok) {
        const data = await response.json()
        setGuests([...guests, data.guest])
        return { success: true, guest: data.guest }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to create guest' }
    }
  }

  const updateGuest = async (id: string, guestData: UpdateGuestDto) => {
    try {
      const response = await fetch(`/api/guest/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData)
      })

      if (response.ok) {
        const data = await response.json()
        setGuests(guests.map(g => g.id === id ? data.guest : g))
        return { success: true, guest: data.guest }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to update guest' }
    }
  }

  const deleteGuest = async (id: string) => {
    try {
      const response = await fetch(`/api/guest/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setGuests(guests.filter(g => g.id !== id))
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete guest' }
    }
  }

  return {
    guests,
    loading,
    error,
    fetchGuests,
    createGuest,
    updateGuest,
    deleteGuest
  }
}

