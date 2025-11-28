'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { CreditCard, QrCode, Camera, Upload, X, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { useCreateGift, useUpdateGift } from '@/hooks/api/useGift'
import type { CreateGiftDto, UpdateGiftDto, Gift } from '@/types/gift'

interface GiftPaymentDrawerProps {
  guestName: string
  guestId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  trigger?: React.ReactNode
  gift?: Gift | null // If provided, it's edit mode
}

export default function GiftPaymentDrawer({
  guestName,
  guestId,
  open,
  onOpenChange,
  onSuccess,
  trigger,
  gift,
}: GiftPaymentDrawerProps) {
  const isEditMode = !!gift
  const createGiftMutation = useCreateGift()
  const updateGiftMutation = useUpdateGift()

  const [giftForm, setGiftForm] = useState({
    paymentMethod: 'cash' as 'cash' | 'khqr',
    currency: 'khr' as 'khr' | 'usd',
    amount: '',
    note: '',
    file: null as File | null,
    receiptImageUrl: '' as string,
  })

  // Load gift data when in edit mode
  React.useEffect(() => {
    if (gift && open) {
      setGiftForm({
        paymentMethod: gift.paymentMethod,
        currency: gift.currency,
        amount: gift.amount.toString(),
        note: gift.note || '',
        file: null,
        receiptImageUrl: gift.receiptImage || '',
      })
    } else if (!gift && open) {
      // Reset form for create mode
      setGiftForm({
        paymentMethod: 'cash',
        currency: 'khr',
        amount: '',
        note: '',
        file: null,
        receiptImageUrl: '',
      })
    }
  }, [gift, open])

  const handleSave = async () => {
    if (!giftForm.amount) return

    try {
      if (isEditMode && gift) {
        const updateData: UpdateGiftDto = {
          paymentMethod: giftForm.paymentMethod,
          currency: giftForm.currency,
          amount: parseFloat(giftForm.amount),
          note: giftForm.note || undefined,
          receiptImage: giftForm.file ? undefined : (giftForm.receiptImageUrl || undefined),
        }

        await updateGiftMutation.mutateAsync({
          id: gift.id,
          data: updateData,
          file: giftForm.file || undefined,
        })
      } else {
        const giftData: CreateGiftDto = {
          guestId,
          paymentMethod: giftForm.paymentMethod,
          currency: giftForm.currency,
          amount: parseFloat(giftForm.amount),
          note: giftForm.note || undefined,
        }

        await createGiftMutation.mutateAsync({
          data: giftData,
          file: giftForm.file || undefined,
        })
      }

      // Reset form
      setGiftForm({
        paymentMethod: 'cash',
        currency: 'khr',
        amount: '',
        note: '',
        file: null,
        receiptImageUrl: '',
      })
      onSuccess?.()
      onOpenChange(false)
    } catch {
      // Error is handled by the mutation hook
    }
  }

  const handleFileSelect = (isCamera: boolean) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    if (isCamera) {
      input.capture = 'environment'
    }
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) setGiftForm({ ...giftForm, file })
    }
    input.click()
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className="max-h-screen h-full w-full sm:max-w-lg">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-lg font-semibold text-black">
                {isEditMode ? 'កែប្រែចំណងដៃ' : 'ចំណងដៃថ្មី'}
              </DrawerTitle>
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
          {/* Payment Method Selection */}
          <div>
            <Label className="text-sm font-semibold text-black mb-3 block">វិធីសាស្ត្រទូទាត់</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGiftForm({ ...giftForm, paymentMethod: 'cash' })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  giftForm.paymentMethod === 'cash'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-semibold text-black">សាច់ប្រាក់</p>
              </button>
              <button
                type="button"
                onClick={() => setGiftForm({ ...giftForm, paymentMethod: 'khqr' })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  giftForm.paymentMethod === 'khqr'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <QrCode className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-semibold text-black">KHQR</p>
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <Label className="text-sm font-semibold text-black mb-3 block">រូបិយប័ណ្ណ</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setGiftForm({ ...giftForm, currency: 'khr' })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  giftForm.currency === 'khr'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-semibold text-black">រៀល</p>
              </button>
              <button
                type="button"
                onClick={() => setGiftForm({ ...giftForm, currency: 'usd' })}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  giftForm.currency === 'usd'
                    ? 'border-black bg-gray-100'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-semibold text-black">ដុល្លារ</p>
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <Label htmlFor={`amount-${guestId}`} className="text-sm font-semibold text-black mb-2 block">
              ចំនួនទឹកប្រាក់ *
            </Label>
            <Input
              id={`amount-${guestId}`}
              type="number"
              placeholder="ចំនួនទឹកប្រាក់ក្នុងសំបុត្រ"
              value={giftForm.amount}
              onChange={(e) => setGiftForm({ ...giftForm, amount: e.target.value })}
              className="h-10"
              required
            />
          </div>

          {/* Note Input */}
          <div>
            <Label htmlFor={`note-${guestId}`} className="text-sm font-semibold text-black mb-2 block">
              កត់ចំណាំ
            </Label>
            <Textarea
              id={`note-${guestId}`}
              placeholder="កត់ចំណាំ"
              value={giftForm.note}
              onChange={(e) => setGiftForm({ ...giftForm, note: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* File Upload Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => handleFileSelect(true)}
            >
              <Camera className="h-4 w-4 mr-2" />
              ថតរូប
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => handleFileSelect(false)}
            >
              <Upload className="h-4 w-4 mr-2" />
              ជ្រើសរើសឯកសារ
            </Button>
          </div>

          {(giftForm.file || giftForm.receiptImageUrl) && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 truncate">
                  {giftForm.file ? giftForm.file.name : 'Receipt image'}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    setGiftForm({
                      ...giftForm,
                      file: null,
                      receiptImageUrl: '',
                    })
                  }
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {giftForm.receiptImageUrl && !giftForm.file && (
                <div className="mt-2 relative w-full h-32 rounded overflow-hidden">
                  <Image
                    src={giftForm.receiptImageUrl}
                    alt="Receipt"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="px-4 py-4 border-t">
          <Button
            className="w-full bg-black hover:bg-gray-800 text-white h-11"
            onClick={handleSave}
            disabled={!giftForm.amount || createGiftMutation.isPending || updateGiftMutation.isPending}
          >
            {createGiftMutation.isPending || updateGiftMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'កំពុងរក្សាទុក...' : 'កំពុងបង្កើត...'}
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                រក្សាទុក
              </>
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

