import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Calendar, MapPin, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { Event } from '@/types/event'

interface DisplayGuest {
  id: string
  name: string
  createdAt: string | Date
  hasGivenGift?: boolean
}

type OverviewProps = {
  event: Event
  guestsWithGifts?: DisplayGuest[]
  giftCount?: number
}

export default function Overview({ event, guestsWithGifts = [], giftCount = 0 }: OverviewProps) {
  return (
    <>
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
    </>
  )
}