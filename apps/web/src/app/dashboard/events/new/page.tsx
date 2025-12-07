'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { EventForm } from '@/components/events/EventForm'

export default function CreateEventPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto">
      <EventForm
        onSuccess={() => {
          // Success is handled by EventForm's internal router.push
        }}
        onCancel={() => {
          router.back()
        }}
      />
    </div>
  )
}

