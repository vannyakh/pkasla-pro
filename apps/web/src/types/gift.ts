export type PaymentMethod = 'cash' | 'khqr'
export type Currency = 'khr' | 'usd'

export interface Gift {
  id: string
  guestId: string | { id: string; name: string; email?: string; phone?: string }
  eventId: string | { id: string; title: string; date: Date | string; venue: string }
  paymentMethod: PaymentMethod
  currency: Currency
  amount: number
  note?: string
  receiptImage?: string
  createdBy?: string | { id: string; name: string; email: string; avatar?: string }
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CreateGiftDto {
  guestId: string
  paymentMethod: PaymentMethod
  currency: Currency
  amount: number
  note?: string
  receiptImage?: string
}

export interface UpdateGiftDto {
  paymentMethod?: PaymentMethod
  currency?: Currency
  amount?: number
  note?: string
  receiptImage?: string
}

export interface GiftListFilters {
  guestId?: string
  eventId?: string
  paymentMethod?: PaymentMethod
  currency?: Currency
  page?: number
  pageSize?: number
}

export interface GiftListResponse {
  items: Gift[]
  total: number
  page: number
  pageSize: number
}

