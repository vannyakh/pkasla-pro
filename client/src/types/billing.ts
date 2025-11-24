export interface Billing {
  id: string
  userId: string
  plan: 'basic' | 'premium' | 'enterprise'
  amount: number
  status: 'active' | 'cancelled' | 'expired'
  nextBillingDate: string
  createdAt: string
}

export interface PaymentMethod {
  id: string
  userId: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface BillingHistory {
  id: string
  userId: string
  amount: number
  plan: string
  date: string
  status: 'paid' | 'pending' | 'failed'
}

