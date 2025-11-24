export interface Event {
  id: string
  title: string
  description?: string
  date: string
  venue: string
  guestCount: number
  status: 'published' | 'draft' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface CreateEventDto {
  title: string
  description?: string
  date: string
  venue: string
  guestCount?: number
}

export interface UpdateEventDto {
  title?: string
  description?: string
  date?: string
  venue?: string
  guestCount?: number
  status?: Event['status']
}

