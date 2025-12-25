'use client'

import React, { useMemo, useState, useCallback } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Filter, Plus, CheckCircle2, Eye, QrCode, MoreVertical, Trash2, Share2, Sheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Guest } from '@/types/guest'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/ui/data-table'
import CreateGuestDrawer from '@/components/guests/CreateGuestDrawer'
import GuestDetailsDrawer, { type DisplayGuest } from '@/components/guests/GuestDetailsDrawer'
import GiftPaymentDrawer from '@/components/guests/GiftPaymentDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'
import InviteCardDialog from '@/components/events/InviteCardDialog'
import { useGiftsByGuest } from '@/hooks/api/useGift'
import { useEvent } from '@/hooks/api/useEvent'
import { 
  useGoogleSheetsSyncConfig, 
  useSyncGuestsToSheets,
  useGoogleConnectionStatus,
  useGetGoogleAuthUrl,
  useDisconnectGoogle 
} from '@/hooks/api/useGuest'
import toast from 'react-hot-toast'
import { api } from '@/lib/axios-client'
import InviteCardDrawer from '@/components/guests/InviteCardDrawer'

export type { DisplayGuest } from '@/components/guests/GuestDetailsDrawer'

interface GuestsProps {
  displayGuests: DisplayGuest[]
  searchQuery: string
  onSearchChange: (query: string) => void
  filteredGuests: DisplayGuest[]
  isGuestDrawerOpen: boolean
  onGuestDrawerOpenChange: (open: boolean) => void
  editingGuest?: Guest | null
  onEditingGuestChange?: (guest: Guest | null) => void
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
  rawGuests?: Guest[]
}

export default function Guests({
  displayGuests,
  filteredGuests,
  isGuestDrawerOpen,
  onGuestDrawerOpenChange,
  editingGuest,
  onEditingGuestChange,
  selectedGuestForGift,
  onSelectedGuestForGiftChange,
  selectedGuestForView,
  onSelectedGuestForViewChange,
  onGiftPayment,
  onDeleteGuest,
  eventId,
  router,
  createGuestMutation,
  deleteGuestMutation,
  getTagColor,
  rawGuests,
}: GuestsProps) {
  // State for full screen view
  const [selectedGuestForFullScreen, setSelectedGuestForFullScreen] = useState<DisplayGuest | null>(null)
  const [sharingGuestId, setSharingGuestId] = useState<string | null>(null)
  const [isInviteCardDialogOpen, setIsInviteCardDialogOpen] = useState(false)
  const [selectedGuestForInviteCard, setSelectedGuestForInviteCard] = useState<DisplayGuest | null>(null)
  
  // Google Sheets sync state
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [spreadsheetId, setSpreadsheetId] = useState('')
  const [sheetName, setSheetName] = useState('Guests')
  const [autoCreate, setAutoCreate] = useState(false)
  
  // Fetch event data for invitation cards
  const { data: event } = useEvent(eventId)
  
  // Google Sheets sync hooks
  const { data: sheetsConfig } = useGoogleSheetsSyncConfig(eventId)
  const syncMutation = useSyncGuestsToSheets(eventId)
  
  // Google OAuth hooks
  const { data: googleConnection } = useGoogleConnectionStatus()
  const connectGoogleMutation = useGetGoogleAuthUrl()
  const disconnectGoogleMutation = useDisconnectGoogle()
  
  // Fetch raw guests if not provided (convert displayGuests back to Guest type)
  const guestsForInvite = useMemo(() => {
    if (rawGuests) return rawGuests
    // Convert displayGuests back to Guest type
    return displayGuests.map((dg) => ({
      ...dg,
      tag: typeof dg.tag === 'object' ? dg.tag.label : dg.tag,
    })) as Guest[]
  }, [rawGuests, displayGuests])
  
  // Fetch gift data for the selected guest (for table row actions)
  const { data: guestGifts = [] } = useGiftsByGuest(selectedGuestForView?.id || '')
  const selectedGuestGift = guestGifts.length > 0 ? guestGifts[0] : null

  // Handle share invite link
  const handleShareInvite = useCallback(async (guestId: string) => {
    try {
      setSharingGuestId(guestId)
      
      // Check if event has a template selected
      const eventResponse = await api.get<{ templateSlug?: string }>(`/events/${eventId}`)
      const event = eventResponse.data
      
      if (!event?.templateSlug) {
        toast.error('Please select a template for this event before sharing invites', {
          duration: 5000,
        })
        return
      }
      
      // First try to get the guest to see if inviteToken is included
      const guestResponse = await api.get<{ inviteToken?: string }>(`/guests/${guestId}`)
      const guest = guestResponse.data
      
      let inviteToken: string | undefined = guest?.inviteToken
      
      // If no token, regenerate it
      if (!inviteToken) {
        const tokenResponse = await api.post<{ token: string }>(`/guests/${guestId}/regenerate-token`)
        if (tokenResponse.success && tokenResponse.data) {
          inviteToken = tokenResponse.data.token
        } else {
          throw new Error('Failed to get invite token')
        }
      }
      
      if (inviteToken) {
        const inviteUrl = `${window.location.origin}/invite/${inviteToken}`
        await navigator.clipboard.writeText(inviteUrl)
        toast.success('Invite link copied to clipboard!')
      } else {
        throw new Error('No invite token available')
      }
    } catch (error) {
      console.error('Error sharing invite:', error)
      toast.error('Failed to share invite link')
    } finally {
      setSharingGuestId(null)
    }
  }, [eventId])

  // Handle Google Sheets sync
  const handleSyncToSheets = useCallback(async () => {
    try {
      const result = await syncMutation.mutateAsync({
        spreadsheetId: spreadsheetId || undefined,
        sheetName: sheetName || 'Guests',
        autoCreate: autoCreate || !spreadsheetId,
      })
      
      // Show success with link to spreadsheet
      toast.success(
        <div className="flex flex-col gap-1">
          <p>Successfully synced {result.synced} guests!</p>
          <a 
            href={result.spreadsheetUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-sm"
          >
            Open Spreadsheet →
          </a>
        </div>,
        { duration: 7000 }
      )
      
      setIsSyncDialogOpen(false)
      setSpreadsheetId('')
      setSheetName('Guests')
      setAutoCreate(false)
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Sync error:', error)
    }
  }, [spreadsheetId, sheetName, autoCreate, syncMutation])

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
                  onClick={(e) => e.stopPropagation()}
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
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] sm:text-xs h-7"
                      onClick={(e) => e.stopPropagation()}
                    >
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
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 w-7 p-0"
                onClick={(e) => {
                  e.stopPropagation()
                  handleShareInvite(guest.id)
                }}
                disabled={sharingGuestId === guest.id}
                title="Share invite link"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedGuestForInviteCard(guest)
                  setIsInviteCardDrawerOpen(true)
                }} 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 w-7 p-0 hidden sm:flex"
              >
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
                      // Find the full guest object from displayGuests
                      const fullGuest = displayGuests.find(g => g.id === guest.id)
                      if (fullGuest && onEditingGuestChange) {
                        // Convert DisplayGuest to Guest type for the drawer
                        const guestToEdit = {
                          ...fullGuest,
                          eventId: typeof fullGuest.eventId === 'string' 
                            ? fullGuest.eventId 
                            : fullGuest.eventId.id,
                        } as Guest
                        onEditingGuestChange(guestToEdit)
                        onGuestDrawerOpenChange(true)
                      }
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
    [selectedGuestForGift, selectedGuestForView, selectedGuestGift, getTagColor, onSelectedGuestForGiftChange, onGiftPayment, onSelectedGuestForViewChange, onDeleteGuest, deleteGuestMutation.isPending, displayGuests, onEditingGuestChange, onGuestDrawerOpenChange, sharingGuestId, handleShareInvite]
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

  // Handle row click for full screen
  const handleRowClick = (guest: DisplayGuest) => {
    setSelectedGuestForFullScreen(guest)
  }

  const [isInviteCardDrawerOpen, setIsInviteCardDrawerOpen] = useState(false)

  return (
    <div className="space-y-4">
      {/* Google Sheets Connection Banner */}
      {sheetsConfig?.enabled && !googleConnection?.connected && (
        <Card className="border border-blue-200 bg-blue-50 dark:bg-blue-950 p-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <Sheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Connect Google Sheets
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-200 mb-3">
                  Connect your Google account to sync guests to Google Sheets. Your spreadsheets will be created in your own Google Drive.
                </p>
                <Button
                  size="sm"
                  onClick={() => connectGoogleMutation.mutate()}
                  disabled={connectGoogleMutation.isPending}
                  className="h-8 text-xs"
                >
                  {connectGoogleMutation.isPending ? 'Connecting...' : 'Connect Google Account'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            onRowClick={handleRowClick}
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
                {sheetsConfig?.enabled && googleConnection?.connected && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-9"
                    onClick={() => setIsSyncDialogOpen(true)}
                    disabled={syncMutation.isPending}
                  >
                    <Sheet className="h-3.5 w-3.5 mr-1.5" />
                    <span className="hidden md:inline">
                      {syncMutation.isPending ? 'Syncing...' : 'Sync to Sheets'}
                    </span>
                    <span className="md:hidden">Sync</span>
                  </Button>
                )}
                {/* <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-9"
                  onClick={() => setIsInviteCardDialogOpen(true)}
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                  <span className="hidden md:inline">ធៀបអញ្ជើញ</span>
                  <span className="md:hidden">ធៀប</span>
                </Button> */}
                <CreateGuestDrawer
                  open={isGuestDrawerOpen}
                  onOpenChange={(open) => {
                    onGuestDrawerOpenChange(open)
                    if (!open && onEditingGuestChange) {
                      onEditingGuestChange(null)
                    }
                  }}
                  guest={editingGuest || undefined}
                  eventId={eventId}
                  onSuccess={() => {
                    // Guest creation/update is handled by CreateGuestDrawer internally
                    // This callback is just for notification purposes
                    if (onEditingGuestChange) {
                      onEditingGuestChange(null)
                    }
                  }}
                  trigger={
                    <Button 
                      size="sm" 
                      className="text-xs h-9" 
                      disabled={createGuestMutation.isPending}
                      onClick={() => {
                        if (onEditingGuestChange) {
                          onEditingGuestChange(null)
                        }
                      }}
                    >
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

      {/* Full Screen Guest Details Drawer */}
      <GuestDetailsDrawer
        guest={selectedGuestForFullScreen}
        open={!!selectedGuestForFullScreen}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGuestForFullScreen(null)
          }
        }}
        selectedGuestForGift={selectedGuestForGift}
        onSelectedGuestForGiftChange={onSelectedGuestForGiftChange}
        selectedGuestForView={selectedGuestForView}
        onSelectedGuestForViewChange={onSelectedGuestForViewChange}
        onGiftPayment={onGiftPayment}
        onDeleteGuest={onDeleteGuest}
        eventId={eventId}
        router={router}
        deleteGuestMutation={deleteGuestMutation}
        getTagColor={getTagColor}
        onEditGuest={(guest) => {
          if (onEditingGuestChange) {
            onEditingGuestChange(guest)
          }
        }}
        onOpenEditDrawer={() => {
          onGuestDrawerOpenChange(true)
        }}
      />

      {/* Invitation Card Designer Dialog */}
      <InviteCardDialog
        open={isInviteCardDialogOpen}
        onOpenChange={setIsInviteCardDialogOpen}
        guests={guestsForInvite}
        event={event}
      />

      {/* Invitation Card Drawer */}
      <InviteCardDrawer
        open={isInviteCardDrawerOpen}
        onOpenChange={(open) => {
          setIsInviteCardDrawerOpen(open)
          if (!open) {
            setSelectedGuestForInviteCard(null)
          }
        }}
        guest={selectedGuestForInviteCard ? {
          ...selectedGuestForInviteCard,
          tag: typeof selectedGuestForInviteCard.tag === 'object' 
            ? selectedGuestForInviteCard.tag.label 
            : selectedGuestForInviteCard.tag,
        } as Guest : undefined}
        event={event}
      />

      {/* Google Sheets Sync Dialog */}
      <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sheet className="h-5 w-5" />
              Sync Guests to Google Sheets
            </DialogTitle>
            <DialogDescription>
              Sync all your event guests to a Google Spreadsheet for easy sharing and collaboration.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="autoCreate"
                  checked={autoCreate}
                  onCheckedChange={(checked) => {
                    setAutoCreate(checked as boolean)
                    if (checked) {
                      setSpreadsheetId('')
                    }
                  }}
                />
                <Label htmlFor="autoCreate" className="text-sm font-medium cursor-pointer">
                  Create new spreadsheet automatically
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                A new spreadsheet will be created with your event name
              </p>
            </div>

            {!autoCreate && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="spreadsheetId">
                    Spreadsheet ID <span className="text-muted-foreground text-xs">(optional)</span>
                  </Label>
                  <Input
                    id="spreadsheetId"
                    placeholder="1ABC...XYZ"
                    value={spreadsheetId}
                    onChange={(e) => setSpreadsheetId(e.target.value)}
                    disabled={autoCreate}
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy from the spreadsheet URL: docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheetName">Sheet Name</Label>
                  <Input
                    id="sheetName"
                    placeholder="Guests"
                    value={sheetName}
                    onChange={(e) => setSheetName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Name of the sheet tab within the spreadsheet
                  </p>
                </div>
              </>
            )}

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📊 What gets synced:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li>All guest information (name, email, phone, etc.)</li>
                <li>Gift status and details</li>
                <li>Tags and notes</li>
                <li>Created and updated timestamps</li>
              </ul>
            </div>

            {!autoCreate && !spreadsheetId && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-3">
                <p className="text-xs text-amber-800 dark:text-amber-200">
                  💡 <strong>Tip:</strong> If you don&apos;t have a spreadsheet ID, check &quot;Create new spreadsheet automatically&quot; to create one for you.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsSyncDialogOpen(false)
                setSpreadsheetId('')
                setSheetName('Guests')
                setAutoCreate(false)
              }}
              disabled={syncMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSyncToSheets}
              disabled={syncMutation.isPending || (!autoCreate && !spreadsheetId)}
            >
              {syncMutation.isPending ? (
                <>
                  <span className="mr-2">Syncing...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </>
              ) : (
                <>
                  <Sheet className="h-4 w-4 mr-2" />
                  Sync {displayGuests.length} Guests
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

