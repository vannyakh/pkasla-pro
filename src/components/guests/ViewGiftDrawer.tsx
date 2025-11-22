'use client'

import React from 'react'
import { X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface Gift {
  id: string
  date: string
  type: string
  amount?: number
  currency?: string
}

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
  const currencyLabel = gift.currency === 'USD' ? 'ដុល្លារ' : 'រៀល'
  
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
        <div className="px-4 py-6 overflow-y-auto flex-1 space-y-4">
          {/* Payment Type */}
          <div>
            <p className="text-xs font-semibold text-black mb-2">ប្រភេទការទូទាត់</p>
            <p className="text-sm text-gray-700">{gift.type}</p>
          </div>

          {/* Amount */}
          {gift.amount && (
            <div>
              <p className="text-xs font-semibold text-black mb-2">ចំនួនទឹកប្រាក់</p>
              <p className="text-sm font-semibold text-black">
                {gift.amount} {currencyLabel}
              </p>
            </div>
          )}

          {/* Date */}
          <div>
            <p className="text-xs font-semibold text-black mb-2">កាលបរិច្ឆេទ</p>
            <p className="text-sm text-gray-700">{gift.date}</p>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600">Gift ID: {gift.id}</p>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

