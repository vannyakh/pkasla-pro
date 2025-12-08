'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CheckCircle2, AlertCircle, Calendar, MapPin } from 'lucide-react'
import { api } from '@/lib/axios-client'
import toast from 'react-hot-toast'
import type { Event } from '@/types/event'

export default function JoinEventPage() {
  const params = useParams()
  const router = useRouter()
  const token = params?.token as string

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  // Fetch event by QR token
  useEffect(() => {
    const fetchEvent = async () => {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await api.get<Event>(`/events/qr/${token}`)
        if (response.success && response.data) {
          setEvent(response.data)
        } else {
          toast.error('Event not found or invalid QR code')
          router.push('/')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        const message = error instanceof Error ? error.message : 'Failed to load event'
        toast.error(message)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [token, router])

  // Handle join event
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!token) {
      toast.error('Invalid QR code')
      return
    }

    try {
      setIsJoining(true)
      const response = await api.post(`/guests/qr/${token}/join`, {
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      })

      if (response.success) {
        setIsJoined(true)
        toast.success('Successfully joined the event!')
      } else {
        throw new Error(response.error || 'Failed to join event')
      }
    } catch (error) {
      console.error('Error joining event:', error)
      const message = error instanceof Error ? error.message : 'Failed to join event'
      toast.error(message)
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="text-gray-600">Event not found or invalid QR code</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">Successfully Joined!</h2>
              <p className="text-gray-600">
                You have successfully joined <strong>{event.title}</strong>
              </p>
              {event.date && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {event.venue && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{event.venue}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{event.title}</CardTitle>
          {event.description && (
            <p className="text-sm text-gray-600 text-center mt-2">{event.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            {event.date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
            {event.venue && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{event.venue}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={isJoining}
              />
            </div>

            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isJoining}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isJoining}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isJoining || !formData.name.trim()}
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                'Join Event'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

