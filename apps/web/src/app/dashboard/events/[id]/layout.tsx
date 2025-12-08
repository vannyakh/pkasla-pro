import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'
import { generateMetadata as generateBaseMetadata } from '@/lib/metadata'
import { api } from '@/lib/axios-client'
import type { Event } from '@/types/event'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@/components/ui/shadcn-io/avatar-group'
import PreviewDrawer from '@/components/events/PreviewDrawer'

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

// Static data for collaborators/hosts
const AVATARS = [
  {
    src: 'https://pbs.twimg.com/profile_images/1909615404789506048/MTqvRsjo_400x400.jpg',
    fallback: 'SK',
    tooltip: 'Skyleen',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1593304942210478080/TUYae5z7_400x400.jpg',
    fallback: 'CN',
    tooltip: 'Shadcn',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1677042510839857154/Kq4tpySA_400x400.jpg',
    fallback: 'AW',
    tooltip: 'Adam Wathan',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1783856060249595904/8TfcCN0r_400x400.jpg',
    fallback: 'GR',
    tooltip: 'Guillermo Rauch',
  },
  {
    src: 'https://pbs.twimg.com/profile_images/1534700564810018816/anAuSfkp_400x400.jpg',
    fallback: 'JH',
    tooltip: 'Jhey',
  },
]

function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link href="/dashboard/events">
          <Button variant="ghost" size="sm" className="text-xs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
        <div className="flex items-center gap-4">
          {/* Avatar Group for Collaborators/Hosts */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-0.5 rounded-full">
            <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-1.5 rounded-full">
              <AvatarGroup variant="css">
                {AVATARS.map((avatar, index) => (
                  <Avatar key={index}>
                    <AvatarImage src={avatar.src} />
                    <AvatarFallback>{avatar.fallback}</AvatarFallback>
                    <AvatarGroupTooltip>
                      <p>{avatar.tooltip}</p>
                    </AvatarGroupTooltip>
                  </Avatar>
                ))}
              </AvatarGroup>
            </div>
          </div>
          {/* Preview Drawer Button */}
          <PreviewDrawer />
        </div>
      </div>
      {children}
    </div>
  )
}

export default EventDetailLayout
