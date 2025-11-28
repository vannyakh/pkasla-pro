'use client'

import React from 'react'
import { X, FileText, Calendar, DollarSign, CreditCard, QrCode, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import type { Gift } from '@/types/gift'
import Image from 'next/image'

interface ViewGiftDrawerProps {
  guestName: string
  gift: Gift
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ViewGiftDrawer({
  guestName,
  gift,
  open,
  onOpenChange,
}: ViewGiftDrawerProps) {
  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    return d.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatCurrency = (amount: number, currency: 'khr' | 'usd') => {
    if (currency === 'usd') {
      return `${amount.toLocaleString()} ដុល្លារ`
    }
    return `${amount.toLocaleString()} រៀល`
  }

  const getPaymentMethodLabel = (method: 'cash' | 'khqr') => {
    return method === 'khqr' ? 'KHQR' : 'សាច់ប្រាក់'
  }

  const getCurrencyLabel = (currency: 'khr' | 'usd') => {
    return currency === 'usd' ? 'ដុល្លារ' : 'រៀល'
  }

  const eventTitle =
    typeof gift.eventId === 'string'
      ? 'Unknown Event'
      : gift.eventId.title

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="max-h-screen h-full w-full sm:max-w-lg">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold text-black">ពត៌មានចំណងដៃ</DrawerTitle>
              <DrawerDescription className="text-sm text-gray-600 mt-1">
                ឈ្មោះ {guestName}
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="px-4 py-6 overflow-y-auto flex-1 space-y-6">
          {/* Amount - Highlighted */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600">ចំនួនទឹកប្រាក់</p>
            </div>
            <p className="text-2xl font-bold text-black">
              {formatCurrency(gift.amount, gift.currency)}
            </p>
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {gift.paymentMethod === 'khqr' ? (
                <QrCode className="h-4 w-4 text-gray-600" />
              ) : (
                <CreditCard className="h-4 w-4 text-gray-600" />
              )}
              <p className="text-xs font-semibold text-black">វិធីសាស្ត្រទូទាត់</p>
            </div>
            <p className="text-sm text-gray-700">{getPaymentMethodLabel(gift.paymentMethod)}</p>
          </div>

          {/* Currency */}
          <div>
            <p className="text-xs font-semibold text-black mb-2">រូបិយប័ណ្ណ</p>
            <p className="text-sm text-gray-700">{getCurrencyLabel(gift.currency)}</p>
          </div>

          {/* Event */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <p className="text-xs font-semibold text-black">ព្រឹត្តិការណ៍</p>
            </div>
            <p className="text-sm text-gray-700">{eventTitle}</p>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs font-semibold text-black mb-2">កាលបរិច្ឆេទ</p>
            <p className="text-sm text-gray-700">{formatDate(gift.createdAt)}</p>
          </div>

          {/* Note */}
          {gift.note && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-gray-600" />
                <p className="text-xs font-semibold text-black">កត់ចំណាំ</p>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{gift.note}</p>
            </div>
          )}

          {/* Receipt Image */}
          {gift.receiptImage && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-4 w-4 text-gray-600" />
                <p className="text-xs font-semibold text-black">រូបភាពបង្កាន់ដៃ</p>
              </div>
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={gift.receiptImage}
                  alt="Receipt"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">Gift ID: {gift.id}</p>
            {gift.createdBy && (
              <p className="text-xs text-gray-600 mt-1">
                Recorded by:{' '}
                {typeof gift.createdBy === 'string'
                  ? gift.createdBy
                  : gift.createdBy.name || gift.createdBy.email}
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

