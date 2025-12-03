'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Loader2, CheckCircle2, QrCode, Download, CreditCard, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { 
  useCreateBakongTemplatePayment, 
  useCreateStripeTemplatePayment,
  usePurchaseTemplate, 
  useCheckTemplateOwnership 
} from '@/hooks/api/useTemplatePurchase'
import { StripeProvider } from '@/providers/StripeProvider'
import { StripePaymentForm } from '@/components/payments/StripePaymentForm'
import { useCountdown } from '@/hooks/useCountdown'
import type { Template } from '@/types/template'
import toast from 'react-hot-toast'

type PaymentMethod = 'bakong' | 'stripe'

interface BakongQRDisplayProps {
  qrCode: string;
  expiresAt?: string;
  isCheckingPayment?: boolean;
  onExpired: () => void;
}

function BakongQRDisplay({ qrCode, expiresAt, isCheckingPayment, onExpired }: BakongQRDisplayProps) {
  const countdown = useCountdown({
    targetDate: expiresAt || null,
    onExpire: onExpired,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="h-5 w-5 text-gray-600" />
          <p className="text-sm font-semibold text-black">ស្កេនដើម្បីបង់ប្រាក់</p>
        </div>
        <div className="w-64 h-64 bg-white rounded-lg mb-4 flex items-center justify-center border border-gray-200 relative overflow-hidden">
          {countdown.isExpired ? (
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
              <p className="text-sm font-semibold text-red-600">QR Code ផុតកំណត់</p>
            </div>
          ) : (
            <Image
              src={qrCode}
              alt="Payment QR Code"
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        
        {expiresAt && !countdown.isExpired && (
          <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              ផុតកំណត់ក្នុង: {countdown.formatted}
            </span>
          </div>
        )}
        
        {countdown.isExpired ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg mb-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-xs text-red-700 text-center">
              QR Code នេះផុតកំណត់ហើយ។ សូមបង្កើតថ្មី។
            </p>
          </div>
        ) : (
          <a
            href={qrCode}
            download
            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer mb-2"
          >
            <Download className="h-3 w-3" />
            ទាញយក QR Code
          </a>
        )}

        {isCheckingPayment && !countdown.isExpired && (
          <div className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200 mt-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <p className="text-sm text-blue-700">
              កំពុងពិនិត្យការទូទាត់...
            </p>
          </div>
        )}

        {!countdown.isExpired && (
          <div className="text-xs text-gray-500 text-center space-y-1 mt-2">
            <p>សូមស្កេន QR Code ដោយប្រើកម្មវិធី Bakong របស់អ្នក</p>
            <p>ការទូទាត់នឹងត្រូវបានពិនិត្យដោយស្វ័យប្រវត្តិ</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface TemplatePaymentDialogProps {
  template: Template | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function TemplatePaymentDialog({
  template,
  open,
  onOpenChange,
  onSuccess,
}: TemplatePaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bakong')
  const [paymentData, setPaymentData] = useState<{ qrCode: string; transactionId: string; expiresAt?: string } | null>(null)
  const [stripePaymentIntent, setStripePaymentIntent] = useState<{ clientSecret: string; paymentIntentId: string } | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  
  const createBakongPaymentMutation = useCreateBakongTemplatePayment()
  const createStripePaymentMutation = useCreateStripeTemplatePayment()
  const purchaseTemplateMutation = usePurchaseTemplate()
  const { data: ownsTemplate, refetch: refetchOwnership } = useCheckTemplateOwnership(
    template?.id || ''
  )

  const isFree = !template?.price || template.price === 0

  // Reset payment data when dialog closes
  useEffect(() => {
    if (!open) {
      setPaymentData(null)
      setStripePaymentIntent(null)
      setIsCheckingPayment(false)
      setPaymentMethod('bakong')
    }
  }, [open])

  // Check if user already owns the template
  useEffect(() => {
    if (open && template?.id) {
      refetchOwnership()
    }
  }, [open, template?.id, refetchOwnership])

  // Handle free template purchase
  const handleFreePurchase = async () => {
    if (!template) return

    try {
      await purchaseTemplateMutation.mutateAsync({
        templateId: template.id,
        paymentMethod: 'free',
      })
      onSuccess?.()
      onOpenChange(false)
    } catch {
      // Error is handled by the mutation
    }
  }

  // Create payment for paid templates
  const handleCreatePayment = async () => {
    if (!template) return

    try {
      if (paymentMethod === 'bakong') {
        const payment = await createBakongPaymentMutation.mutateAsync({
          templateId: template.id,
        })
        setPaymentData({
          qrCode: payment.qrCode,
          transactionId: payment.transactionId,
          expiresAt: payment.expiresAt,
        })
        // Start checking payment status
        setIsCheckingPayment(true)
        checkPaymentStatus()
      } else if (paymentMethod === 'stripe') {
        const paymentIntent = await createStripePaymentMutation.mutateAsync({
          templateId: template.id,
        })
        setStripePaymentIntent({
          clientSecret: paymentIntent.clientSecret,
          paymentIntentId: paymentIntent.paymentIntentId,
        })
        // For Stripe, we would integrate Stripe Elements here
        // The UI will show a message that Stripe integration is needed
      }
    } catch {
      // Error is handled by the mutation
    }
  }

  // Check payment status periodically
  const checkPaymentStatus = () => {
    const maxAttempts = 30 // Check for 5 minutes (30 * 10 seconds)
    let attempts = 0

    const checkInterval = setInterval(async () => {
      attempts++
      
      try {
        // Refetch ownership to check if payment was successful
        const { data: owns } = await refetchOwnership()
        
        if (owns) {
          clearInterval(checkInterval)
          setIsCheckingPayment(false)
          toast.success('Payment successful! Template purchased.')
          onSuccess?.()
          onOpenChange(false)
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval)
          setIsCheckingPayment(false)
          toast.error('Payment timeout. Please try again.')
        }
      } catch {
        // Continue checking
      }
    }, 10000) // Check every 10 seconds

    // Cleanup on unmount or dialog close
    return () => clearInterval(checkInterval)
  }

  if (!template) return null

  // If user already owns the template
  if (ownsTemplate) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] max-w-2xl mx-auto">
          <DrawerHeader>
            <DrawerTitle className="text-lg font-semibold text-black">
              អ្នកមានគំរូនេះរួចហើយ
            </DrawerTitle>
            <DrawerDescription>
              អ្នកបានទិញគំរូ &quot;{template.name}&quot; រួចហើយ
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">
            <div className="flex items-center justify-center py-8">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              យល់ព្រម
            </Button>
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] max-w-2xl mx-auto">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold text-black">
            {isFree ? 'ទិញគំរូ' : 'បង់ប្រាក់សម្រាប់គំរូ'}
          </DrawerTitle>
          <DrawerDescription>
            {template.name}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-6 overflow-y-auto flex-1 space-y-6">
          {/* Template Info */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-600">តម្លៃ</p>
            </div>
            <p className="text-2xl font-bold text-black">
              {isFree ? 'ឥតគិតថ្លៃ' : `$${template.price?.toFixed(2)}`}
            </p>
          </div>

          {/* Free Template */}
          {isFree && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                គំរូនេះឥតគិតថ្លៃ។ ចុចប៊ូតុងខាងក្រោមដើម្បីទិញ
              </p>
              <Button
                onClick={handleFreePurchase}
                disabled={purchaseTemplateMutation.isPending}
                className="w-full"
              >
                {purchaseTemplateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    កំពុងទិញ...
                  </>
                ) : (
                  'ទិញឥឡូវ'
                )}
              </Button>
            </div>
          )}

          {/* Paid Template - Payment Method Selection */}
          {!isFree && (
            <div className="space-y-4">
              {!paymentData && !stripePaymentIntent ? (
                <div className="space-y-4">
                  {/* Payment Method Selection */}
                  <div>
                    <p className="text-sm font-semibold text-black mb-3">ជ្រើសរើសវិធីសាស្ត្រទូទាត់</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bakong')}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          paymentMethod === 'bakong'
                            ? 'border-black bg-gray-100'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <QrCode className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-semibold text-black">Bakong</p>
                        <p className="text-xs text-gray-500 mt-1">KHQR</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-4 border-2 rounded-lg text-center transition-colors ${
                          paymentMethod === 'stripe'
                            ? 'border-black bg-gray-100'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                        <p className="text-sm font-semibold text-black">Stripe</p>
                        <p className="text-xs text-gray-500 mt-1">Credit Card</p>
                      </button>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreatePayment}
                    disabled={createBakongPaymentMutation.isPending || createStripePaymentMutation.isPending}
                    className="w-full"
                  >
                    {createBakongPaymentMutation.isPending || createStripePaymentMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        កំពុងបង្កើត...
                      </>
                    ) : paymentMethod === 'bakong' ? (
                      <>
                        <QrCode className="h-4 w-4 mr-2" />
                        បង្កើត Bakong QR Code
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        បង្កើត Stripe Payment
                      </>
                    )}
                  </Button>
                </div>
              ) : paymentData ? (
                <BakongQRDisplay
                  qrCode={paymentData.qrCode}
                  expiresAt={paymentData.expiresAt}
                  isCheckingPayment={isCheckingPayment}
                  onExpired={() => {
                    toast.error("QR code has expired. Please generate a new one.");
                    setPaymentData(null);
                    setPaymentMethod('bakong');
                  }}
                />
              ) : stripePaymentIntent ? (
                <div className="space-y-4">
                  <StripeProvider
                    options={{
                      clientSecret: stripePaymentIntent.clientSecret,
                      appearance: {
                        theme: 'stripe',
                      },
                    }}
                  >
                    <StripePaymentForm
                      clientSecret={stripePaymentIntent.clientSecret}
                      paymentIntentId={stripePaymentIntent.paymentIntentId}
                      amount={template.price || 0}
                      currency="usd"
                      onSuccess={() => {
                        // Check ownership after successful payment
                        setTimeout(async () => {
                          const { data: owns } = await refetchOwnership()
                          if (owns) {
                            toast.success('Payment successful! Template purchased.')
                            onSuccess?.()
                            onOpenChange(false)
                          } else {
                            // Start checking payment status
                            setIsCheckingPayment(true)
                            checkPaymentStatus()
                          }
                        }, 2000)
                      }}
                      onCancel={() => {
                        setStripePaymentIntent(null)
                        setPaymentMethod('bakong')
                      }}
                    />
                  </StripeProvider>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

