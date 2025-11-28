export type GuestStatus = 'pending' | 'confirmed' | 'declined'

export interface Guest {
  id: string
  name: string
  email?: string
  phone?: string
  eventId: string | { id: string; title: string; date: string | Date; venue: string; hostId: string | object }
  userId?: string | { id: string; name: string; email: string; avatar?: string }
  createdBy?: string | { id: string; name: string; email: string; avatar?: string }
  status: GuestStatus
  occupation?: string
  notes?: string
  tag?: string
  address?: string
  province?: string
  photo?: string
  hasGivenGift: boolean
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateGuestDto {
  name: string
  email?: string
  phone?: string
  eventId: string
  userId?: string
  occupation?: string
  notes?: string
  tag?: string
  address?: string
  province?: string
  photo?: string
  hasGivenGift?: boolean
  status?: GuestStatus
}

export interface UpdateGuestDto {
  name?: string
  email?: string
  phone?: string
  occupation?: string
  notes?: string
  tag?: string
  address?: string
  province?: string
  photo?: string
  hasGivenGift?: boolean
  status?: GuestStatus
}

export interface GuestListFilters {
  eventId?: string
  userId?: string
  status?: GuestStatus
  search?: string
  page?: number
  pageSize?: number
}

export interface GuestListResponse {
  items: Guest[]
  total: number
  page: number
  pageSize: number
}

