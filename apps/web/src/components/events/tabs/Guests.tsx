'use client'

import React, { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Filter, Plus, CheckCircle2, Eye, QrCode, MoreVertical, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import GiftPaymentDrawer from '@/components/guests/GiftPaymentDrawer'
import CreateGuestDrawer from '@/components/guests/CreateGuestDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'
import { useGiftsByGuest } from '@/hooks/api/useGift'

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
  filteredGuests,
  isGuestDrawerOpen,
  onGuestDrawerOpenChange,
  selectedGuestForGift,
  onSelectedGuestForGiftChange,
  selectedGuestForView,
  onSelectedGuestForViewChange,
  onCreateGuest: _onCreateGuest, // Unused - CreateGuestDrawer handles creation internally
  onGiftPayment,
  onDeleteGuest,
  eventId,
  router,
  createGuestMutation,
  deleteGuestMutation,
  getTagColor,
}: GuestsProps) {
  // Fetch gift data for the selected guest
  const { data: guestGifts = [] } = useGiftsByGuest(selectedGuestForView?.id || '')
  const selectedGuestGift = guestGifts.length > 0 ? guestGifts[0] : null

  const columns = useMemo<ColumnDef<DisplayGuest>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 48,
      },
      {
        accessorKey: 'name',
        header: 'ឈ្មោះ',
        cell: ({ row }) => (
          <div>
            <p className="text-xs sm:text-sm font-semibold text-black">{row.original.name}</p>
            {row.original.email && (
              <p className="text-[10px] sm:text-xs text-gray-500">{row.original.email}</p>
            )}
            {row.original.phone && (
              <p className="text-[10px] sm:text-xs text-gray-500">{row.original.phone}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'tag',
        header: 'ស្លាក',
        cell: ({ row }) => (
          row.original.tag ? (
            <Badge className={`${getTagColor(row.original.tag.color)} text-xs border`}>
              {row.original.tag.label}
            </Badge>
          ) : (
            <span className="text-xs text-gray-400">-</span>
          )
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => {
          const guest = row.original
          return (
            <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
              {guest.hasGivenGift ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[10px] sm:text-xs h-7 bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                >
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">រួចរាល់</span>
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
                  onSuccess={() => {
                    onGiftPayment(guest.id)
                  }}
                  trigger={
                    <Button variant="outline" size="sm" className="text-[10px] sm:text-xs h-7">
                      <span className="hidden sm:inline">ចង់ដៃ</span>
                      <span className="sm:hidden">ចង់</span>
                    </Button>
                  }
                />
              )}
              {guest.hasGivenGift && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectedGuestForViewChange(guest)
                  }}
                  disabled={!guest.hasGivenGift}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              )}
              {guest.hasGivenGift && selectedGuestForView?.id === guest.id && selectedGuestGift && (
                <ViewGiftDrawer
                  guestName={guest.name}
                  gift={selectedGuestGift}
                  open={selectedGuestForView?.id === guest.id}
                  onOpenChange={(open) => {
                    if (!open) {
                      onSelectedGuestForViewChange(null)
                    }
                  }}
                />
              )}
              <Button variant="ghost" size="sm" className="text-xs h-7 w-7 p-0 hidden sm:flex">
                <QrCode className="h-3.5 w-3.5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 w-7 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/events/${eventId}/guests/${guest.id}/edit`)
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteGuest(guest.id)
                    }}
                    disabled={deleteGuestMutation.isPending}
                  >
                    {deleteGuestMutation.isPending ? 'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        },
      },
    ],
    [selectedGuestForGift, selectedGuestForView, selectedGuestGift, getTagColor, eventId, router, onSelectedGuestForGiftChange, onGiftPayment, onSelectedGuestForViewChange, onDeleteGuest, deleteGuestMutation.isPending]
  )

  // Handle bulk delete
  const handleBulkDelete = async (selectedGuests: DisplayGuest[]) => {
    if (selectedGuests.length === 0) return
    if (confirm(`តើអ្នកពិតជាចង់លុប ${selectedGuests.length} ភ្ញៀវនេះមែនទេ?`)) {
      for (const guest of selectedGuests) {
        await onDeleteGuest(guest.id)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <Card className="border border-gray-200 shadow-none p-0">
        <CardContent className="p-4">
          {/* Title */}
          <h2 className="text-lg font-semibold text-black text-center mb-4">តារាងភ្ញៀវកិត្តយស</h2>
          
          <DataTable
            columns={columns}
            data={filteredGuests}
            searchKey="name"
            searchPlaceholder="ស្វែងរកភ្ញៀវ..."
            fixedHeader={true}
            fixedColumns={1}
            enableFiltering={true}
            enableSorting={true}
            enablePagination={true}
            enableRowSelection={true}
            enableColumnVisibility={true}
            enableExport={true}
            exportOptions={{
              filename: `guests-${eventId}`,
              formats: ['csv', 'json'],
            }}
            bulkActions={[
              {
                label: 'លុបដែលបានជ្រើស',
                icon: <Trash2 className="h-4 w-4" />,
                onClick: handleBulkDelete,
                variant: 'destructive',
              },
            ]}
            renderToolbarBefore={() => (
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="text-xs h-9 hidden sm:flex">
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden md:inline">ស្លាក</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9 hidden sm:flex">
                  <span className="hidden md:inline">នាំចូល</span>
                </Button>
                <CreateGuestDrawer
                  open={isGuestDrawerOpen}
                  onOpenChange={onGuestDrawerOpenChange}
                  onSuccess={() => {
                    // Guest creation is handled by CreateGuestDrawer internally
                    // This callback is just for notification purposes
                  }}
                  trigger={
                    <Button size="sm" className="text-xs h-9" disabled={createGuestMutation.isPending}>
                      <Plus className="h-3.5 w-3.5 mr-1 sm:mr-1.5" />
                      <span className="hidden sm:inline">{createGuestMutation.isPending ? 'Creating...' : 'បង្កើតភ្ញៀវថ្មី'}</span>
                      <span className="sm:hidden">បង្កើត</span>
                    </Button>
                  }
                />
              </div>
            )}
            pageSize={10}
            size="middle"
            scroll={{ y: 400 }}
            showRowCount={false}
            emptyMessage="មិនទាន់មានភ្ញៀវ"
          />
          
          <div className="mt-4 pt-3 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">សរុប {filteredGuests.length} / {displayGuests.length} នាក់</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

