'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, MapPin, Settings, FileText, QrCode, Info, UserCheck, Trash2, Eye, MoreVertical, CheckCircle2, Search, Filter, Plus, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import GiftPaymentDrawer from '@/components/guests/GiftPaymentDrawer'
import CreateGuestDrawer from '@/components/guests/CreateGuestDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useEvent, useDeleteEvent } from '@/hooks/api/useEvent'
import { useGuestsByEvent, useCreateGuest, useUpdateGuest, useDeleteGuest } from '@/hooks/api/useGuest'
import type { Guest as GuestType } from '@/types/guest'

// Extended guest interface for UI display (includes gift info)
interface DisplayGuest extends Omit<GuestType, 'tag'> {
  tag?: {
    label: string
    color: 'red' | 'blue' | 'green'
    icon?: string
  }
  gift?: {
    id: string
    date: string
    type: string
    amount?: number
    currency?: string
  }
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  // Unwrap params Promise
  const { id } = React.use(params)
  
  // Fetch event data
  const { data: event, isLoading: eventLoading, error: eventError } = useEvent(id)
  const { data: guests = [], isLoading: guestsLoading } = useGuestsByEvent(id)
  const createGuestMutation = useCreateGuest()
  const updateGuestMutation = useUpdateGuest()
  const deleteGuestMutation = useDeleteGuest()
  const deleteEventMutation = useDeleteEvent()
  
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuestForGift, setSelectedGuestForGift] = useState<DisplayGuest | null>(null)
  const [selectedGuestForView, setSelectedGuestForView] = useState<DisplayGuest | null>(null)
  
  // Transform guests for display (add tag and gift info if needed)
  const displayGuests: DisplayGuest[] = useMemo(() => {
    return guests.map(guest => {
      const { tag: tagString, ...restGuest } = guest
      const displayGuest: DisplayGuest = { ...restGuest }
      
      // Map tag string to display format
      if (tagString) {
        const tagMap: Record<string, { label: string; color: 'red' | 'blue' | 'green' }> = {
          'bride': { label: 'ភ្ញៀវកូនក្រមុំ', color: 'red' },
          'groom': { label: 'ភ្ញៀវកូនកំលោះ', color: 'blue' },
        }
        const tagInfo = tagMap[tagString] || { label: tagString, color: 'green' }
        displayGuest.tag = tagInfo
      }
      
      // For now, gift info is not stored in backend (only hasGivenGift boolean)
      // This would need to be implemented in a separate gifts/payments table
      // For now, we'll just show hasGivenGift status
      
      return displayGuest
    })
  }, [guests])
  
  // Get guests who have given gifts
  const guestsWithGifts = displayGuests.filter(guest => guest.hasGivenGift)
  const giftCount = guestsWithGifts.length
  
  // Filter guests by search query
  const filteredGuests = displayGuests.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guest.email && guest.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (guest.phone && guest.phone.toLowerCase().includes(searchQuery.toLowerCase()))
  )
  
  // Loading state
  if (eventLoading || guestsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }
  
  // Error state
  if (eventError || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">
            {eventError?.message || 'Failed to load event'}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }
  
  // Handle delete event
  const handleDeleteEvent = async () => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      await deleteEventMutation.mutateAsync(id)
      router.push('/dashboard/events')
    }
  }
  
  // Handle create guest
  const handleCreateGuest = async (formData: { 
    name: string
    phone?: string
    occupation?: string
    notes?: string
    tag?: string
    address?: string
    province?: string
  }) => {
    await createGuestMutation.mutateAsync({
      name: formData.name,
      phone: formData.phone,
      eventId: id,
      tag: formData.tag,
      occupation: formData.occupation,
      notes: formData.notes,
      address: formData.address,
      province: formData.province,
    })
    setIsGuestDrawerOpen(false)
  }
  
  // Handle update guest (for gift payment)
  const handleGiftPayment = async (guestId: string) => {
    await updateGuestMutation.mutateAsync({
      id: guestId,
      data: {
        hasGivenGift: true,
        // Note: Gift details (amount, type, etc.) would need a separate gifts/payments table
        // For now, we're just marking hasGivenGift as true
      },
    })
    setSelectedGuestForGift(null)
  }
  
  // Handle delete guest
  const handleDeleteGuest = async (guestId: string) => {
    if (confirm('Are you sure you want to delete this guest?')) {
      await deleteGuestMutation.mutateAsync({ id: guestId, eventId: id })
    }
  }
  
  const getTagColor = (color?: string) => {
    switch (color) {
      case 'red':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'blue':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'green':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'completed':
        return 'outline'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Event Info Block */}
      <Card className="border border-gray-200 shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-xl font-bold text-black">{event.title}</CardTitle>
                <Badge variant={getStatusColor(event.status)} className="capitalize">
                  {event.status}
                </Badge>
              </div>
              {event.description && (
                <p className="text-sm text-gray-600 mb-3">{event.description}</p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={handleDeleteEvent}
              disabled={deleteEventMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {deleteEventMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
    <div>
                <p className="text-xs text-gray-600 mb-0.5">Event Date</p>
                <p className="text-sm font-semibold text-black">{formatDate(typeof event.date === 'string' ? event.date : event.date.toISOString())}</p>
        </div>
      </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                <div>
                <p className="text-xs text-gray-600 mb-0.5">Venue</p>
                <p className="text-sm font-semibold text-black">{event.venue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                <div>
                <p className="text-xs text-gray-600 mb-0.5">Guests</p>
                <p className="text-sm font-semibold text-black">{event.guestCount} នាក់</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
                <div>
                <p className="text-xs text-gray-600 mb-0.5">Created</p>
                <p className="text-sm font-semibold text-black">{formatDateTime(typeof event.createdAt === 'string' ? event.createdAt : event.createdAt.toISOString())}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="overview" className="text-xs">
            <Info className="h-3.5 w-3.5 mr-1.5" />
            ទូទៅ
          </TabsTrigger>
          <TabsTrigger value="guests" className="text-xs">
            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
            ភ្ញៀវកិត្តយស
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-xs">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            កាលវិភាគ
          </TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            កែប្រែ
          </TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            គំរូធៀបខ្ញុំ
          </TabsTrigger>
          <TabsTrigger value="qr" className="text-xs">
            <QrCode className="h-3.5 w-3.5 mr-1.5" />
            បង្កើតQR
          </TabsTrigger>
        </TabsList>

        {/* ទូទៅ Tab - View Only */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Event Title Block */}
            <Card className="border border-gray-200 p-4 shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-semibold text-black">Event Title</CardTitle>
                </div>
                <p className="text-sm text-black">{event.title}</p>
              </CardContent>
            </Card>

            {/* Event Date & Time Block */}
            <Card className="border border-gray-200 p-4 shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-semibold text-black">Event Date & Time</CardTitle>
                </div>
                <p className="text-sm text-black">
                  {formatDate(typeof event.date === 'string' ? event.date : event.date.toISOString())}
                </p>
              </CardContent>
            </Card>

            {/* Venue Block */}
            <Card className="border border-gray-200 p-4 shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-semibold text-black">Venue</CardTitle>
                </div>
                <p className="text-sm text-black">{event.venue}</p>
              </CardContent>
            </Card>

            {/* Total Guests Block */}
            <Card className="border border-gray-200 p-4 shadow-none">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <CardTitle className="text-sm font-semibold text-black">Total Guests</CardTitle>
                </div>
                <p className="text-sm text-black">{event.guestCount} នាក់</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Gifts/Donations Section */}
          <div className="mt-6">
            <CardTitle className="text-lg font-semibold text-black mb-2">ចំណងដៃថ្មីៗ</CardTitle>
            <p className="text-sm text-gray-600 mb-4">បានទទួលចំណងដៃសរុបចំនួន {giftCount}នាក់</p>
            
            {giftCount > 0 ? (
              <div className="space-y-3">
                {guestsWithGifts.map((guest) => {
                  const initial = guest.name.charAt(0).toUpperCase()
                  const createdAt = new Date(guest.createdAt).toLocaleDateString('km-KH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                  return (
                    <div key={guest.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{initial}</span>
              </div>
              <div>
                          <p className="text-sm font-semibold text-black">{guest.name}</p>
                          <p className="text-xs text-gray-600">{createdAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          បានចង់ដៃ
                        </Badge>
                      </div>
              </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-600 text-center py-4">មិនទាន់មានចំណងដៃ</p>
            )}
          </div>
        </TabsContent>

        {/* Guests Tab */}
        <TabsContent value="guests" className="mt-4">
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
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                onOpenChange={setIsGuestDrawerOpen}
                onSave={handleCreateGuest}
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
                                      setSelectedGuestForGift(null)
                                    } else {
                                      setSelectedGuestForGift(guest)
                                    }
                                  }}
                                  onSave={() => {
                                    handleGiftPayment(guest.id)
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
                                    setSelectedGuestForView(guest)
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
                                      setSelectedGuestForView(null)
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
                                    onClick={() => router.push(`/dashboard/events/${id}/guests/${guest.id}/edit`)}
                                  >
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleDeleteGuest(guest.id)}
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
                  <p className="text-xs text-gray-600">សរុប {filteredGuests.length} / {guests.length} នាក់</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-4">
          <Card className="border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">កាលវិភាគ (Schedule)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Schedule management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-4">
          <Card className="border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">កែប្រែ (Settings)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-black mb-1.5 block">Event Status</label>
                <select
                  defaultValue={event.status}
                  className="w-full h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="pt-2">
                <Button className="bg-black hover:bg-gray-800 text-white text-xs">
                  Save Settings
                </Button>
            </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="mt-4">
          <Card className="border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">គំរូធៀបខ្ញុំ (My Templates)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">Template management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* QR Code Tab */}
        <TabsContent value="qr" className="mt-4">
          <Card className="border border-gray-200 shadow-none">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">បង្កើតQR (Generate QR)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">QR code generation coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
