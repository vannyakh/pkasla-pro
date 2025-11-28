export type BillingCycle = 'monthly' | 'yearly';

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  maxEvents: number | null; // null = unlimited
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanDto {
  name: string;
  displayName: string;
  description?: string;
  price: number;
  billingCycle: BillingCycle;
  maxEvents: number | null;
  features: string[];
  isActive?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  displayName?: string;
  description?: string;
  price?: number;
  billingCycle?: BillingCycle;
  maxEvents?: number | null;
  features?: string[];
  isActive?: boolean;
}

