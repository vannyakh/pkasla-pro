export type EventStatus = 'published' | 'draft' | 'completed' | 'cancelled'
export type EventType = 'wedding' | 'engagement' | 'hand-cutting' | 'birthday' | 'anniversary' | 'other'

export interface Event {
  id: string
  title: string
  description?: string
  eventType: EventType
  date: string | Date
  venue: string
  googleMapLink?: string
  hostId: string | { id: string; name: string; email: string; avatar?: string }
  coverImage?: string
  khqrUsd?: string
  khqrKhr?: string
  restrictDuplicateNames: boolean
  status: EventStatus
  guestCount: number
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateEventDto {
  title: string
  description?: string
  eventType: EventType
  date: string
  venue: string
  googleMapLink?: string
  coverImage?: string
  khqrUsd?: string
  khqrKhr?: string
  restrictDuplicateNames?: boolean
  status?: EventStatus
}

export interface UpdateEventDto {
  title?: string
  description?: string
  eventType?: EventType
  date?: string
  venue?: string
  googleMapLink?: string
  coverImage?: string
  khqrUsd?: string
  khqrKhr?: string
  restrictDuplicateNames?: boolean
  status?: EventStatus
}

export interface EventListFilters {
  hostId?: string
  status?: EventStatus
  eventType?: EventType
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

export interface EventListResponse {
  items: Event[]
  total: number
  page: number
  pageSize: number
}

