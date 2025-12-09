'use client'

import React, { useMemo } from 'react'
import { Eye, ExternalLink } from 'lucide-react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsContents,
} from '@/components/ui/shadcn-io/tabs'
import Iphone15Pro from '@/components/ui/shadcn-io/iphone-15-pro'
import { Android } from '@/components/ui/shadcn-io/android'
import { Spinner } from '@/components/ui/shadcn-io/spinner'
import { useEvent } from '@/hooks/api/useEvent'
import type { Event } from '@/types/event'
import Link from 'next/link'

interface PreviewDrawerProps {
  event?: Event
  eventId?: string
}

function PreviewDrawer({ event: eventProp, eventId: eventIdProp }: PreviewDrawerProps) {
  const params = useParams()
  const eventId = eventIdProp || (params?.id as string)
  
  // Fetch event data if not provided as prop (only when eventId is available and event is not)
  const shouldFetch = !eventProp && !!eventId
  const { data: fetchedEvent, isLoading } = useEvent(shouldFetch ? eventId : '')
  
  const event = eventProp || fetchedEvent

  // Generate preview URL with event data (same flow as Templates.tsx)
  const previewUrl = useMemo(() => {
    if (!event) return null

    // If event has a template slug, use template preview
    if (event.templateSlug) {
      // Create sample data for preview (same as Templates.tsx)
      const sampleEvent = {
        title: event.title || 'Sample Event',
        description: event.description || 'This is a sample event description',
        date: event.date || new Date().toISOString(),
        venue: event.venue || 'Sample Venue',
        googleMapLink: event.googleMapLink,
        coverImage: event.coverImage,
      }
      
      const sampleGuest = {
        name: 'John Doe',
        email: 'john@example.com',
        inviteToken: 'sample-token',
      }
      
      const sampleAssets = {
        images: event.userTemplateConfig?.images || {},
        colors: event.userTemplateConfig?.colors || {},
        fonts: event.userTemplateConfig?.fonts || {},
      }

      const params = new URLSearchParams({
        event: JSON.stringify(sampleEvent),
        guest: JSON.stringify(sampleGuest),
        assets: JSON.stringify(sampleAssets),
        preview: 'true',
      })

      return `/templates/base/${event.templateSlug}?${params.toString()}`
    }

    // Fallback to public event page if no template
    return `/events/${event.id}`
  }, [event])

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs" disabled={isLoading || !event}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle>Event Preview</SheetTitle>
              <SheetDescription>
                Preview how your event will appear to guests
              </SheetDescription>
            </div>
            {previewUrl && event && (
              <Link href={previewUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="text-xs">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Open
                </Button>
              </Link>
            )}
          </div>
        </SheetHeader>
        
        {isLoading && !event ? (
          <div className="flex-1 flex items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : !event ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-500">No event data available</p>
          </div>
        ) : !previewUrl || !event.templateSlug ? (
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">No template selected for this event</p>
              <p className="text-xs text-gray-500">
                Go to the Templates tab to select a template for your event
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col mt-6 min-h-0">
            <Tabs defaultValue="ios" className="w-full p-6 flex-1 flex flex-col">
              <TabsList className="w-full shrink-0">
                <TabsTrigger value="ios" className="flex-1">
                  iOS
                </TabsTrigger>
                <TabsTrigger value="android" className="flex-1">
                  Android
                </TabsTrigger>
              </TabsList>
              <TabsContents className="flex-1 mt-6 min-h-0 overflow-hidden">
                <TabsContent value="ios" className="mt-0 h-full">
                  <div className="flex justify-center items-center h-full min-h-0 py-4">
                    <div className="w-full max-w-[320px] h-full max-h-[600px]">
                      <Iphone15Pro className="w-full h-full">
                        {previewUrl && (
                          <iframe
                            src={previewUrl}
                            className="w-full h-full rounded-[2.5rem] border-none"
                            title="Event Preview iOS"
                            sandbox="allow-same-origin allow-scripts"
                            style={{
                              transform: 'scale(0.95)',
                              transformOrigin: 'center',
                            }}
                          />
                        )}
                      </Iphone15Pro>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="android" className="mt-0 h-full">
                  <div className="flex justify-center items-center h-full min-h-0 py-4">
                    <div className="w-full max-w-[320px] h-full max-h-[600px]">
                      <Android className="w-full h-full">
                        {previewUrl && (
                          <iframe
                            src={previewUrl}
                            className="w-full h-full rounded-3xl border-none"
                            title="Event Preview Android"
                            sandbox="allow-same-origin allow-scripts"
                            style={{
                              transform: 'scale(0.95)',
                              transformOrigin: 'center',
                            }}
                          />
                        )}
                      </Android>
                    </div>
                  </div>
                </TabsContent>
              </TabsContents>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default PreviewDrawer
