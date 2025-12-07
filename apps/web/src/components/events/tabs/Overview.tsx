'use client'

import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Info, Calendar, MapPin, Users, QrCode, Download } from 'lucide-react'
import { formatDate } from '@/helpers'
import { Event } from '@/types/event'
import Image from 'next/image'
import { ImageZoom } from '@/components/ui/shadcn-io/image-zoom'

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
                  {formatDate(typeof event.date === 'string' ? event.date : event.date)}
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

          {/* QR Code Payment Section */}
          {(event.khqrKhr || event.khqrUsd) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* KHR QR Code */}
              {event.khqrKhr && (
                <Card className="border border-gray-200 shadow-none p-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-base font-semibold text-black">ស្កេនប្រាក់រៀល</CardTitle>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="w-48 h-48 bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200 relative overflow-hidden">
                        <ImageZoom className="relative w-full h-full">
                        <Image
                          src={event.khqrKhr}
                          alt="KHQR KHR"
                            width={192}
                            height={192}
                            className="object-cover w-full h-full"
                          unoptimized
                        />
                        </ImageZoom>
                      </div>
                      <a
                        href={event.khqrKhr}
                        download
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        ទាញយក QR Code
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* USD QR Code */}
              {event.khqrUsd && (
                <Card className="border border-gray-200 shadow-none p-0">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <QrCode className="h-5 w-5 text-gray-600" />
                      <CardTitle className="text-base font-semibold text-black">ស្កេនប្រាក់ដុល្លារ</CardTitle>
                    </div>
                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="w-48 h-48 bg-white rounded-lg mb-3 flex items-center justify-center border border-gray-200 relative overflow-hidden">
                        <ImageZoom className="relative w-full h-full">
                        <Image
                          src={event.khqrUsd}
                          alt="KHQR USD"
                            width={192}
                            height={192}
                            className="object-cover w-full h-full"
                          unoptimized
                        />
                        </ImageZoom>
                      </div>
                      <a
                        href={event.khqrUsd}
                        download
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="h-3 w-3" />
                        ទាញយក QR Code
                      </a>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recent Gifts/Donations Section */}
          {giftCount > 0 && (
            <Card className="mt-6 border border-gray-200 shadow-none p-0">
              <CardContent className="p-4">
                <CardTitle className="text-lg font-semibold text-black mb-2">ចំណងដៃថ្មីៗ</CardTitle>
                <p className="text-sm text-gray-600 mb-4">បានទទួលចំណងដៃសរុបចំនួន {giftCount} នាក់</p>
                
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
                      <div key={guest.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
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
              </CardContent>
            </Card>
          )}
    </>
  )
}