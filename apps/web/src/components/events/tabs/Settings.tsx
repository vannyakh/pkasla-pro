'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EventForm } from '@/components/events/EventForm'
import { Event } from '@/types/event'
import { useRouter } from 'next/navigation'

interface SettingsProps {
  event: Event
  onUpdateStatus?: (status: import('@/types/event').EventStatus) => Promise<void>
  updateEventMutation?: { isPending: boolean }
}

export default function Settings({ 
  event,
}: SettingsProps) {
  const router = useRouter()

  const handleSuccess = () => {
    // Optionally refresh the page or show a success message
    // The event data will be refetched automatically by React Query
    router.refresh()
  }

  const handleCancel = () => {
    // Stay on the same page, just close any modals if needed
    // Since we're in a tab, we don't need to navigate away
  }

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">កែប្រែ (Settings)</CardTitle>
      </CardHeader>
      <CardContent>
        <EventForm
          event={event}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  )
}

