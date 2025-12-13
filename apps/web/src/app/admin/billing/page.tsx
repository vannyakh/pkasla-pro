'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { BillingOverviewCards } from '@/components/admin/billing/BillingOverviewCards'
import { PaymentLogStats } from '@/components/admin/payment-logs/PaymentLogStats'
import { usePaymentLogStats } from '@/hooks/api/usePaymentLog'

export default function AdminBillingPage() {
  const { data: stats, isLoading } = usePaymentLogStats({})

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-black">Billing Overview</h1>
        <p className="text-xs md:text-sm text-gray-600 mt-1">
          Monitor all subscriptions, payments and billing
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
          <span className="ml-2 text-xs text-gray-600">Loading billing data...</span>
        </div>
      ) : stats ? (
        <>
          {/* Overview Cards */}
          <BillingOverviewCards stats={stats} isLoading={isLoading} />

          {/* Detailed Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-black">Payment Statistics</h2>
              <Link href="/admin/payment-logs">
                <Button variant="outline" size="sm" className="text-xs h-9">
                  <Receipt className="h-3.5 w-3.5 mr-1.5" />
                  View Payment Logs
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
            <PaymentLogStats stats={stats} />
          </div>

          {/* Additional Information Card */}
          <Card className="border  gap-0 border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-black">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className='py-0'>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/admin/user_subscrip">
                  <Button variant="outline" className="w-full justify-start text-xs h-9">
                    Manage Subscriptions
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
                <Link href="/admin/payment-logs">
                  <Button variant="outline" className="w-full justify-start text-xs h-9">
                    Payment Transaction Logs
                    <ArrowRight className="h-3 w-3 ml-auto" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="border  gap-0 border-gray-200">
          <CardContent className="py-0">
            <p className="text-center text-sm text-gray-500">No billing data available</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

