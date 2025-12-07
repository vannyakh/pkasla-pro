import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata'
import { api } from '@/lib/axios-client'
import type { Event } from '@/types/event'

/**
 * Generate metadata for event detail page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch event data for metadata
    const response = await api.get<Event>(`/events/${id}`);
    
    if (response.success && response.data) {
      const event = response.data;
      const eventDate = typeof event.date === 'string' 
        ? new Date(event.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : event.date instanceof Date
        ? event.date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })
        : '';

      const title = `${event.title} - Event`;
      const description = event.description 
        ? `${event.description} | Event on ${eventDate} at ${event.venue}`
        : `${event.title} - Event Details on ${eventDate} at ${event.venue}`;
      
      
      const image = event.coverImage || undefined;
      // Use event cover image as favicon, fallback to default
      const icon = event.coverImage || undefined;
      const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/dashboard/events/${id}`;

      return generateBaseMetadata({
        title,
        description,
        image,
        icon,
        url,
        type: 'website',
        keywords: [
          'event',
          event.eventType,
          event.venue,
          eventDate,
          'phkasla',
          'event management',
          `event-${id}`,
        ],
      });
    }
  } catch (error) {
    console.error('Failed to fetch event for metadata:', error);
  }

  // Fallback metadata if event fetch fails
  return generateBaseMetadata({
    title: 'Event Details',
    description: 'View event details and manage your event',
  });
}

function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
      {children}
    </div>
  )
}

export default EventDetailLayout
