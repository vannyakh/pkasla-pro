export interface Guest {
  id: string
  name: string
  email: string
  phone?: string
  eventId: string
  status: 'pending' | 'confirmed' | 'declined'
  createdAt: string
  updatedAt: string
}

export interface CreateGuestDto {
  name: string
  email: string
  phone?: string
  eventId: string
}

export interface UpdateGuestDto {
  name?: string
  email?: string
  phone?: string
  status?: Guest['status']
}

