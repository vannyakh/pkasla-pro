'use client'

import React, { useState } from 'react'
import { Calendar, Users, MapPin, Settings, FileText, QrCode, Info, UserCheck, Trash2, Eye, MoreVertical, CheckCircle2, Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import GiftPaymentDrawer, { GiftFormData } from '@/components/guests/GiftPaymentDrawer'
import CreateGuestDrawer from '@/components/guests/CreateGuestDrawer'
import ViewGiftDrawer from '@/components/guests/ViewGiftDrawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Event } from '@/types/event'

// Sample guest data
interface Guest {
  id: string
  name: string
  email: string
  hasGivenGift?: boolean
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

// Sample event data
const sampleEvent: Event & { image?: string; time?: string; googleMapLink?: string } = {
  id: '1',
  title: 'ពិធីភ្ជាប់ពាក្យ',
  description: 'ពិធីភ្ជាប់ពាក្យ និង',
  date: '2025-12-27T07:00:00',
  venue: 'Phnom Penh',
  guestCount: 0,
  status: 'published',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  time: '07:00 AM',
  googleMapLink: 'https://maps.google.com/...',
}

// Sample guests data - TODO: Fetch from API
const sampleGuests: Guest[] = [
  { 
    id: '1', 
    name: 'Pkasla', 
    email: 'pkasla@example.com',
    hasGivenGift: false
  },
  { 
    id: '2', 
    name: 'Seyha', 
    email: 'seyha@example.com',
    hasGivenGift: true,
    tag: {
      label: 'ភ្ញៀវកូនក្រមុំ',
      color: 'red',
      icon: 'heart'
    },
    gift: {
      id: 'gift2',
      date: '17 តុលា 2025, 12:32 ល្ងាច',
      type: 'ប្រភេទ៖ KHQR',
      amount: 100,
      currency: 'USD'
    }
  },
  { 
    id: '3', 
    name: 'Kim Da', 
    email: 'kimda@example.com',
    hasGivenGift: true,
    tag: {
      label: 'ភ្ញៀវកូនកំលោះ',
      color: 'blue',
      icon: 'diamond'
    },
    gift: {
      id: 'gift3',
      date: '17 តុលា 2025, 12:27 ល្ងាច',
      type: 'ប្រភេទ៖ សាច់ប្រាក់',
      amount: 50,
      currency: 'USD'
    }
  },
]

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise
  const { id } = React.use(params)
  
  // TODO: Fetch event data using id
  const [event] = useState(sampleEvent)
  const [guests, setGuests] = useState<Guest[]>(sampleGuests)
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGuestForGift, setSelectedGuestForGift] = useState<Guest | null>(null)
  const [selectedGuestForView, setSelectedGuestForView] = useState<Guest | null>(null)
  
  // Use id to avoid unused variable warning
  React.useEffect(() => {
    // Future: Fetch event and guests by id
  }, [id])
  
  // Get guests who have given gifts
  const guestsWithGifts = guests.filter(guest => guest.hasGivenGift && guest.gift)
  const giftCount = guestsWithGifts.length
  
  // Filter guests by search query
  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
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
            <Button variant="outline" size="sm" className="text-xs">
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-600 mt-0.5 shrink-0" />
    <div>
                <p className="text-xs text-gray-600 mb-0.5">Event Date</p>
                <p className="text-sm font-semibold text-black">{formatDate(event.date)}</p>
                {event.time && <p className="text-xs text-gray-600">{event.time}</p>}
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
                <p className="text-sm font-semibold text-black">{formatDateTime(event.createdAt)}</p>
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
                  {formatDate(event.date)} {event.time && `at ${event.time}`}
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
                  const amount = guest.gift!.amount
                  const currency = guest.gift!.currency === 'USD' ? 'ដុល្លារ' : 'រៀល'
                  return (
                    <div key={guest.gift!.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-600">{initial}</span>
              </div>
              <div>
                          <p className="text-sm font-semibold text-black">{guest.name}</p>
                          <p className="text-xs text-gray-600">{guest.gift!.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {amount && (
                          <p className="text-sm font-semibold text-black">{amount} {currency}</p>
                        )}
                        <p className="text-xs text-gray-600">{guest.gift!.type}</p>
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
                onSave={(formData) => {
                  // Add new guest to the list
                  const newGuest: Guest = {
                    id: `guest-${Date.now()}`,
                    name: formData.name,
                    email: formData.phone || '',
                    hasGivenGift: false,
                    tag: formData.tag ? {
                      label: formData.tag === 'bride' ? 'ភ្ញៀវកូនក្រមុំ' : 'ភ្ញៀវកូនកំលោះ',
                      color: formData.tag === 'bride' ? 'red' : 'blue'
                    } : undefined
                  }
                  setGuests([...guests, newGuest])
                  setIsGuestDrawerOpen(false)
                }}
                trigger={
                  <Button size="sm" className="text-xs h-9">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    បង្កើតភ្ញៀវថ្មី
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
                                  onSave={(formData: GiftFormData) => {
                                    // Update guest to mark as having given gift
                                    setGuests(guests.map(g => {
                                      if (g.id === guest.id) {
                                        return {
                                          ...g,
                                          hasGivenGift: true,
                                          gift: {
                                            id: `gift-${Date.now()}`,
                                            date: new Date().toLocaleDateString('km-KH', {
                                              year: 'numeric',
                                              month: 'long',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            }),
                                            type: formData.paymentMethod === 'cash' ? 'ប្រភេទ៖ សាច់ប្រាក់' : 'ប្រភេទ៖ KHQR',
                                            amount: parseFloat(formData.amount),
                                            currency: formData.currency === 'khr' ? 'KHR' : 'USD'
                                          }
                                        }
                                      }
                                      return g
                                    }))
                                    setSelectedGuestForGift(null)
                                  }}
                                  trigger={
                                    <Button variant="outline" size="sm" className="text-xs h-7">
                                      ចង់ដៃ
                                    </Button>
                                  }
                                />
                              )}
                              {guest.hasGivenGift && guest.gift && (
                                <ViewGiftDrawer
                                  guestName={guest.name}
                                  gift={guest.gift}
                                  open={selectedGuestForView?.id === guest.id}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setSelectedGuestForView(guest)
                                    } else {
                                      setSelectedGuestForView(null)
                                    }
                                  }}
                                />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-7 w-7 p-0"
                                onClick={() => {
                                  if (guest.hasGivenGift && guest.gift) {
                                    setSelectedGuestForView(guest)
                                  }
                                }}
                                disabled={!guest.hasGivenGift || !guest.gift}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
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
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem className="text-gray-600">Delete</DropdownMenuItem>
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
