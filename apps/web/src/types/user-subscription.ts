import type { SubscriptionPlan } from './subscription-plan'

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending'

export interface User {
  id: string
  name?: string
  email?: string
}

export interface UserSubscription {
  id: string
  userId: string | User
  planId: string | SubscriptionPlan
  status: SubscriptionStatus
  startDate: string
  endDate: string
  autoRenew: boolean
  paymentMethod?: string
  transactionId?: string
  cancelledAt?: string
  createdAt: string
  updatedAt: string
}

