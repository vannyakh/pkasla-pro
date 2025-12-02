'use client'

import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { env } from '@/config/env'

// Initialize Stripe
const stripePromise = env.stripePublishableKey
  ? loadStripe(env.stripePublishableKey)
  : null

interface StripeProviderProps {
  children: React.ReactNode
  options?: StripeElementsOptions
}

export function StripeProvider({ children, options }: StripeProviderProps) {
  if (!stripePromise) {
    // If Stripe is not configured, render children without Stripe Elements
    return <>{children}</>
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  )
}

