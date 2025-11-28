'use client'

import React from 'react'
import { Search, Filter, Plus, CheckCircle2, Eye, QrCode, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import GiftPaymentDrawer from '@/components/guests/GiftPaymentDrawer'
import CreateGuestDrawer from '@/components/guests/CreateGuestDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'

interface DisplayGuest {
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

interface GuestsProps {
  displayGuests: DisplayGuest[]
  searchQuery: string
  onSearchChange: (query: string) => void
  filteredGuests: DisplayGuest[]
  isGuestDrawerOpen: boolean
  onGuestDrawerOpenChange: (open: boolean) => void
  selectedGuestForGift: DisplayGuest | null
  onSelectedGuestForGiftChange: (guest: DisplayGuest | null) => void
  selectedGuestForView: DisplayGuest | null
  onSelectedGuestForViewChange: (guest: DisplayGuest | null) => void
  onCreateGuest: (formData: {
    name: string
    phone?: string
    occupation?: string
    notes?: string
    tag?: string
    address?: string
    province?: string
  }) => Promise<void>
  onGiftPayment: (guestId: string) => Promise<void>
  onDeleteGuest: (guestId: string) => Promise<void>
  eventId: string
  router: ReturnType<typeof import('next/navigation').useRouter>
  createGuestMutation: { isPending: boolean }
  updateGuestMutation: { isPending: boolean }
  deleteGuestMutation: { isPending: boolean }
  getTagColor: (color?: string) => string
}

export default function Guests({
  displayGuests,
  searchQuery,
  onSearchChange,
  filteredGuests,
  isGuestDrawerOpen,
  onGuestDrawerOpenChange,
  selectedGuestForGift,
  onSelectedGuestForGiftChange,
  selectedGuestForView,
  onSelectedGuestForViewChange,
  onCreateGuest,
  onGiftPayment,
  onDeleteGuest,
  eventId,
  router,
  createGuestMutation,
  updateGuestMutation,
  deleteGuestMutation,
  getTagColor,
}: GuestsProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <h2 className="text-lg font-semibold text-black text-center">តារាងភ្ញៀវកិត្តយស</h2>
      
      {/* Search and Action Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ស្វែងរក"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-9">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          ស្លាក
        </Button>
        <Button variant="outline" size="sm" className="text-xs h-9">
          នាំចូល
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs h-9">
              ទាញយក
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Excel</DropdownMenuItem>
            <DropdownMenuItem>PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <CreateGuestDrawer
          open={isGuestDrawerOpen}
          onOpenChange={onGuestDrawerOpenChange}
          onSave={onCreateGuest}
          trigger={
            <Button size="sm" className="text-xs h-9" disabled={createGuestMutation.isPending}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              {createGuestMutation.isPending ? 'Creating...' : 'បង្កើតភ្ញៀវថ្មី'}
            </Button>
          }
        />
      </div>

      {/* Table */}
      <Card className="border border-gray-200 shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="w-12 p-3 text-left">
                    <Checkbox />
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-black">
                    <div className="flex items-center gap-1">
                      ឈ្មោះ
                      <span className="text-gray-400">↕</span>
                    </div>
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-black">ស្លាក</th>
                  <th className="p-3 text-right text-sm font-semibold text-black">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="border-b border-gray-200 last:border-b-0">
                    <td className="p-3">
                      <Checkbox />
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-semibold text-black">{guest.name}</p>
                      {guest.email && (
                        <p className="text-xs text-gray-500">{guest.email}</p>
                      )}
                      {guest.phone && (
                        <p className="text-xs text-gray-500">{guest.phone}</p>
                      )}
                    </td>
                    <td className="p-3">
                      {guest.tag ? (
                        <Badge className={`${getTagColor(guest.tag.color)} text-xs border`}>
                          {guest.tag.label}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        {guest.hasGivenGift ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            រួចរាល់
                          </Button>
                        ) : (
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
                            onSave={() => {
                              onGiftPayment(guest.id)
                            }}
                            trigger={
                              <Button variant="outline" size="sm" className="text-xs h-7">
                                ចង់ដៃ
                              </Button>
                            }
                          />
                        )}
                        {guest.hasGivenGift && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 w-7 p-0"
                            onClick={() => {
                              onSelectedGuestForViewChange(guest)
                            }}
                            disabled={!guest.hasGivenGift}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {guest.hasGivenGift && selectedGuestForView?.id === guest.id && (
                          <ViewGiftDrawer
                            guestName={guest.name}
                            gift={{
                              id: guest.id,
                              date: new Date(guest.updatedAt).toLocaleDateString('km-KH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }),
                              type: 'បានចង់ដៃ',
                            }}
                            open={selectedGuestForView?.id === guest.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                onSelectedGuestForViewChange(null)
                              }
                            }}
                          />
                        )}
                        <Button variant="ghost" size="sm" className="text-xs h-7 w-7 p-0">
                          <QrCode className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-xs h-7 w-7 p-0">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => router.push(`/dashboard/events/${eventId}/guests/${guest.id}/edit`)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => onDeleteGuest(guest.id)}
                              disabled={deleteGuestMutation.isPending}
                            >
                              {deleteGuestMutation.isPending ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">សរុប {filteredGuests.length} / {displayGuests.length} នាក់</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

