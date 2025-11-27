'use client'

import { EventForm } from './EventForm'

interface CreateEventFormProps {
  onSuccess?: () => void
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  return <EventForm onSuccess={onSuccess} />
}
