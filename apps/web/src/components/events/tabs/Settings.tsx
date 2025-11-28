'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Event } from '@/types/event'
import type { EventStatus } from '@/types/event'

interface SettingsProps {
  event: Event
  onUpdateStatus?: (status: EventStatus) => Promise<void>
  updateEventMutation?: { isPending: boolean }
}

export default function Settings({ 
  event, 
  onUpdateStatus,
  updateEventMutation 
}: SettingsProps) {
  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as EventStatus
    if (event.status !== newStatus && onUpdateStatus) {
      await onUpdateStatus(newStatus)
    }
  }

  return (
    <Card className="border border-gray-200 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-black">កែប្រែ (Settings)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-black mb-1.5 block">Event Status</label>
          <select
            value={event.status}
            onChange={handleStatusChange}
            disabled={updateEventMutation?.isPending}
            className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="pt-2">
          <Button 
            className="bg-black hover:bg-gray-800 text-white text-xs"
            disabled={updateEventMutation?.isPending}
            onClick={() => {
              if (onUpdateStatus) {
                onUpdateStatus(event.status)
              }
            }}
          >
            {updateEventMutation?.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

