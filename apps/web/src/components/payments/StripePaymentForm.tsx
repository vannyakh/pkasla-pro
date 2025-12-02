'use client'

import { useState, FormEvent } from 'react'
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface StripePaymentFormProps {
  clientSecret: string
  paymentIntentId: string
  amount: number
  currency: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function StripePaymentForm({
  clientSecret,
  paymentIntentId,
  amount,
  currency,
  onSuccess,
  onCancel,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.')
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!')
        onSuccess?.()
      } else {
        setIsProcessing(false)
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred. Please try again.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing}
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${currency === 'usd' ? '$' : ''}${amount.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  )
}

