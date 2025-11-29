'use client'

import React from 'react'
import { X, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from '@/components/ui/drawer'
import GiftPaymentDrawer from '@/components/guests/GiftPaymentDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'
import { useGiftsByGuest } from '@/hooks/api/useGift'
import type { Gift } from '@/types/gift'

export interface DisplayGuest {
  id: string
  name: string
  email?: string
  phone?: string
  tag?: {
    label: string
    color: 'red' | 'blue' | 'green'
  }
  hasGivenGift: boolean
  updatedAt: string | Date
  createdAt: string | Date
  eventId: string | { id: string; title: string; date: string | Date; venue: string; hostId: string | object }
  status: 'pending' | 'confirmed' | 'declined'
}

interface GuestDetailsDrawerProps {
  guest: DisplayGuest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedGuestForGift: DisplayGuest | null
  onSelectedGuestForGiftChange: (guest: DisplayGuest | null) => void
  selectedGuestForView: DisplayGuest | null
  onSelectedGuestForViewChange: (guest: DisplayGuest | null) => void
  onGiftPayment: (guestId: string) => Promise<void>
  onDeleteGuest: (guestId: string) => Promise<void>
  eventId: string
  router: ReturnType<typeof import('next/navigation').useRouter>
  deleteGuestMutation: { isPending: boolean }
  getTagColor: (color?: string) => string
}

export default function GuestDetailsDrawer({
  guest,
  open,
  onOpenChange,
  selectedGuestForGift,
  onSelectedGuestForGiftChange,
  selectedGuestForView,
  onSelectedGuestForViewChange,
  onGiftPayment,
  onDeleteGuest,
  eventId,
  router,
  deleteGuestMutation,
  getTagColor,
}: GuestDetailsDrawerProps) {
  // Fetch gift data for the guest
  const { data: guestGifts = [] } = useGiftsByGuest(guest?.id || '')
  const guestGift: Gift | null = guestGifts.length > 0 ? guestGifts[0] : null

  if (!guest) return null

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="max-h-screen h-full w-full sm:max-w-2xl">
          <DrawerHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <DrawerTitle className="text-lg font-semibold text-black">
                  ពត៌មានភ្ញៀវ
                </DrawerTitle>
                <DrawerDescription className="text-sm text-gray-600 mt-1">
                  {guest.name}
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
            {/* Guest Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-black mb-3">ពត៌មានទូទៅ</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 min-w-[100px]">ឈ្មោះ:</span>
                    <span className="text-sm font-medium text-black">{guest.name}</span>
                  </div>
                  {guest.email && (
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-600 min-w-[100px]">អ៊ីម៉ែល:</span>
                      <span className="text-sm text-black">{guest.email}</span>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-600 min-w-[100px]">ទូរស័ព្ទ:</span>
                      <span className="text-sm text-black">{guest.phone}</span>
                    </div>
                  )}
                  {guest.tag && (
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-600 min-w-[100px]">ស្លាក:</span>
                      <Badge className={`${getTagColor(guest.tag.color)} text-xs border`}>
                        {guest.tag.label}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 min-w-[100px]">ស្ថានភាព:</span>
                    <Badge
                      variant="outline"
                      className={
                        guest.status === 'confirmed'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : guest.status === 'declined'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    >
                      {guest.status === 'confirmed'
                        ? 'បានបញ្ជាក់'
                        : guest.status === 'declined'
                        ? 'បានបដិសេធ'
                        : 'កំពុងរង់ចាំ'}
                    </Badge>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-sm text-gray-600 min-w-[100px]">ចំណងដៃ:</span>
                    <span className="text-sm text-black">
                      {guest.hasGivenGift ? (
                        <span className="text-green-600 font-medium">បានផ្តល់</span>
                      ) : (
                        <span className="text-gray-500">មិនទាន់</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gift Information */}
              {guest.hasGivenGift && guestGift && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-black mb-3">ពត៌មានចំណងដៃ</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-sm text-gray-600 min-w-[100px]">ចំនួនទឹកប្រាក់:</span>
                      <span className="text-sm font-medium text-black">
                        {guestGift.amount?.toLocaleString('en-US')} {guestGift.currency === 'usd' ? 'ដុល្លារ' : '៛'}
                      </span>
                    </div>
                    {guestGift.paymentMethod && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-600 min-w-[100px]">វិធីសាស្ត្របង់ប្រាក់:</span>
                        <span className="text-sm text-black">
                          {guestGift.paymentMethod === 'khqr' ? 'KHQR' : 'សាច់ប្រាក់'}
                        </span>
                      </div>
                    )}
                    {guestGift.note && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-600 min-w-[100px]">ចំណាំ:</span>
                        <span className="text-sm text-black">{guestGift.note}</span>
                      </div>
                    )}
                    {guestGift.createdAt && (
                      <div className="flex items-start gap-3">
                        <span className="text-sm text-gray-600 min-w-[100px]">កាលបរិច្ឆេទ:</span>
                        <span className="text-sm text-black">
                          {new Date(guestGift.createdAt).toLocaleDateString('km-KH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center gap-2 flex-wrap">
                {!guest.hasGivenGift ? (
                  <GiftPaymentDrawer
                    guestName={guest.name}
                    guestId={guest.id}
                    open={selectedGuestForGift?.id === guest.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        onSelectedGuestForGiftChange(null)
                      } else {
                        onSelectedGuestForGiftChange(guest)
                      }
                    }}
                    onSuccess={() => {
                      onGiftPayment(guest.id)
                    }}
                    trigger={
                      <Button variant="outline" size="sm" className="text-xs">
                        ចង់ដៃ
                      </Button>
                    }
                  />
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      onSelectedGuestForViewChange(guest)
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    មើលចំណងដៃ
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    router.push(`/dashboard/events/${eventId}/guests/${guest.id}/edit`)
                  }}
                >
                  កែប្រែ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (confirm(`តើអ្នកពិតជាចង់លុបភ្ញៀវ ${guest.name} មែនទេ?`)) {
                      onDeleteGuest(guest.id)
                      onOpenChange(false)
                    }
                  }}
                  disabled={deleteGuestMutation.isPending}
                >
                  {deleteGuestMutation.isPending ? 'កំពុងលុប...' : 'លុប'}
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* View Gift Drawer */}
      {guest && selectedGuestForView?.id === guest.id && guestGift && (
        <ViewGiftDrawer
          guestName={guest.name}
          gift={guestGift}
          open={selectedGuestForView?.id === guest.id}
          onOpenChange={(open) => {
            if (!open) {
              onSelectedGuestForViewChange(null)
            }
          }}
        />
      )}
    </>
  )
}

