'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Download, Edit, Trash2, User, FileText, Calendar, DollarSign, Loader2 } from 'lucide-react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { useGiftsByEvent } from '@/hooks/api/useGift'
import { useDeleteGift } from '@/hooks/api/useGift'
import { useGuestsByEvent } from '@/hooks/api/useGuest'
import type { Gift } from '@/types/gift'
import GiftPaymentDrawer from '@/components/guests/GiftPaymentDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'

interface PaymentsProps {
  eventId: string
}

export default function Payments({ eventId }: PaymentsProps) {
  // Fetch gifts for this event
  const { data: gifts = [], isLoading: giftsLoading } = useGiftsByEvent(eventId)
  const { data: guests = [] } = useGuestsByEvent(eventId)
  const deleteGiftMutation = useDeleteGift()

  // State for drawers
  const [isGiftDrawerOpen, setIsGiftDrawerOpen] = useState(false)
  const [isViewGiftDrawerOpen, setIsViewGiftDrawerOpen] = useState(false)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [editingGift, setEditingGift] = useState<Gift | null>(null)

  // Calculate statistics from gifts
  const { payments, totalRiel, totalDollars, totalGuests, contributingGuests } = useMemo(() => {
    const paymentsData = gifts.map((gift) => {
      const guestId = typeof gift.guestId === 'string' ? gift.guestId : gift.guestId.id
      const guest = guests.find((g) => g.id === guestId)
      const guestName = guest?.name || 'Unknown Guest'

      return {
        id: gift.id,
        gift: gift, // Store full gift object for actions
        guestName,
        amount: gift.amount,
        currency: gift.currency.toUpperCase() as 'USD' | 'KHR',
        method: gift.paymentMethod.toUpperCase() === 'KHQR' ? 'KHQR' : 'Cash' as 'KHQR' | 'Cash',
        createdAt: gift.createdAt,
      }
    })

    const totalRiel = gifts
      .filter((g) => g.currency === 'khr')
      .reduce((sum, g) => sum + g.amount, 0)

    const totalDollars = gifts
      .filter((g) => g.currency === 'usd')
      .reduce((sum, g) => sum + g.amount, 0)

    const totalGuests = guests.length
    const contributingGuests = guests.filter((g) => g.hasGivenGift).length

    return {
      payments: paymentsData,
      totalRiel,
      totalDollars,
      totalGuests,
      contributingGuests,
    }
  }, [gifts, guests])

  const formatCurrency = (amount: number, currency: 'USD' | 'KHR') => {
    if (currency === 'USD') {
      return `${amount.toLocaleString()} ដុល្លារ`
    }
    return `${amount.toLocaleString()} រៀល`
  }

  const formatDateKhmer = (date: string | Date) => {
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

  const getMethodLabel = (method: string) => {
    const methodMap: Record<string, string> = {
      'KHQR': 'KHQR',
      'Cash': 'សាច់ប្រាក់',
      'Bank Transfer': 'ការផ្ទេរប្រាក់',
    }
    return methodMap[method] || method
  }

  // Handle view gift
  const handleViewGift = useCallback((gift: Gift) => {
    setSelectedGift(gift)
    setIsViewGiftDrawerOpen(true)
  }, [])

  // Handle edit gift
  const handleEditGift = useCallback((gift: Gift) => {
    setEditingGift(gift)
    setIsGiftDrawerOpen(true)
  }, [])

  // Handle delete gift
  const handleDeleteGift = useCallback(async (gift: Gift) => {
    if (!confirm('Are you sure you want to delete this gift payment?')) return

    const guestId = typeof gift.guestId === 'string' ? gift.guestId : gift.guestId.id
    const eventId = typeof gift.eventId === 'string' ? gift.eventId : gift.eventId.id

    try {
      await deleteGiftMutation.mutateAsync({ id: gift.id, guestId, eventId })
    } catch {
      // Error is handled by the mutation hook
    }
  }, [deleteGiftMutation])

  // Handle gift drawer success
  const handleGiftDrawerSuccess = () => {
    setIsGiftDrawerOpen(false)
    setEditingGift(null)
  }

  const columns = useMemo<ColumnDef<typeof payments[0]>[]>(
    () => [
      {
        accessorKey: 'guestName',
        header: 'ឈ្មោះ',
        cell: ({ row }) => (
          <p className="text-xs sm:text-sm font-semibold text-black">{row.original.guestName}</p>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'ចំនួនចំណងដៃ',
        cell: ({ row }) => (
          <p className="text-xs sm:text-sm text-black">
            {formatCurrency(row.original.amount, row.original.currency)}
          </p>
        ),
      },
      {
        accessorKey: 'method',
        header: 'តាមរយៈ',
        cell: ({ row }) => (
          <p className="text-xs sm:text-sm text-black">{getMethodLabel(row.original.method)}</p>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'ពេលវេលា',
        cell: ({ row }) => (
          <p className="text-xs sm:text-sm text-black">{formatDateKhmer(row.original.createdAt)}</p>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-right"></div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleViewGift(row.original.gift)
              }}
              title="View gift details"
            >
              <FileText className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 w-7 p-0"
              onClick={(e) => {
                e.stopPropagation()
                handleEditGift(row.original.gift)
              }}
              title="Edit gift"
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 w-7 p-0 text-red-600 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteGift(row.original.gift)
              }}
              disabled={deleteGiftMutation.isPending}
              title="Delete gift"
            >
              {deleteGiftMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [handleViewGift, handleEditGift, handleDeleteGift, deleteGiftMutation.isPending]
  )

  if (giftsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading payments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Riel */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">សរុប ប្រាក់រៀល</p>
                <p className="text-lg font-bold text-black">{totalRiel.toLocaleString()} រៀល</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Dollars */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">សរុប ប្រាក់ដុល្លារ</p>
                <p className="text-lg font-bold text-black">{totalDollars.toLocaleString()} ដុល្លារ</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Guests */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">ចំនួនភ្ញៀវសរុប</p>
                <p className="text-lg font-bold text-black">{totalGuests} នាក់</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contributing Guests */}
        <Card className="border border-gray-200 p-4 shadow-none">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">ចំនួនភ្ញៀវដែលបានចងដៃ</p>
                <p className="text-lg font-bold text-black">{contributingGuests} នាក់</p>
              </div>
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="border border-gray-200 shadow-none p-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-black">តារាងចំណងដៃ</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs h-9">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  ទាញយក
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Excel</DropdownMenuItem>
                <DropdownMenuItem>PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
            <DataTable
              columns={columns}
              data={payments}
              searchKey="guestName"
              searchPlaceholder="ស្វែងរកចំណងដៃ..."
              fixedHeader={true}
              fixedColumns={1}
              enableFiltering={true}
              enableSorting={true}
              enableColumnVisibility={false}
              showRowCount={false}
              emptyMessage="មិនទាន់មានចំណងដៃ"
            />
            {payments.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-600">
                  សរុប {payments.length} / {payments.length} ចំណងដៃ
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Gift Drawers */}
      {selectedGift && (
        <ViewGiftDrawer
          guestName={
            typeof selectedGift.guestId === 'string'
              ? guests.find((g) => g.id === selectedGift.guestId)?.name || 'Unknown Guest'
              : selectedGift.guestId.name
          }
          gift={selectedGift}
          open={isViewGiftDrawerOpen}
          onOpenChange={setIsViewGiftDrawerOpen}
        />
      )}

      {editingGift && (
        <GiftPaymentDrawer
          guestName={
            typeof editingGift.guestId === 'string'
              ? guests.find((g) => g.id === editingGift.guestId)?.name || 'Unknown Guest'
              : editingGift.guestId.name
          }
          guestId={typeof editingGift.guestId === 'string' ? editingGift.guestId : editingGift.guestId.id}
          gift={editingGift}
          open={isGiftDrawerOpen}
          onOpenChange={(open) => {
            setIsGiftDrawerOpen(open)
            if (!open) setEditingGift(null)
          }}
          onSuccess={handleGiftDrawerSuccess}
        />
      )}
    </div>
  )
}

