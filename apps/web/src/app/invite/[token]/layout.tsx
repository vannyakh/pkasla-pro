import type { Metadata } from 'next';
import { api } from '@/lib/axios-client';
import { 
  getTemplateBySlug, 
  generateTemplateMetadata,
  generateTemplateStructuredData 
} from '@/templates/base';

interface InviteLayoutProps {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}

interface InviteData {
  event: {
    id?: string;
    title?: string;
    description?: string;
    date?: string;
    venue?: string;
    location?: {
      name?: string;
      address?: string;
    };
    organizer?: {
      name?: string;
    };
  };
  guest: {
    name?: string;
    email?: string;
  };
  template: {
    slug?: string;
    name?: string;
  };
}

/**
 * Generate dynamic metadata for invitation pages
 */
export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  try {
    const { token } = await params;
    
    // Fetch invitation data
    const response = await api.get<InviteData>(`/invites/${token}`);
    
    if (!response.success || !response.data) {
      return {
        title: 'Invitation Not Found',
        description: 'The invitation you are looking for could not be found.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const { event, guest, template: templateData } = response.data;

    // Get template metadata
    const template = templateData?.slug ? getTemplateBySlug(templateData.slug) : null;

    if (!template) {
      return {
        title: event?.title || 'Event Invitation',
        description: event?.description || 'You are invited to this event',
        openGraph: {
          title: event?.title || 'Event Invitation',
          description: event?.description || 'You are invited to this event',
          type: 'website',
        },
      };
    }

    // Format event date
    let eventDate = '';
    if (event?.date) {
      try {
        eventDate = new Date(event.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        eventDate = '';
      }
    }

    // Generate comprehensive metadata
    const metadata = generateTemplateMetadata(template, {
      guestName: guest?.name,
      eventName: event?.title,
      eventDate,
      customDescription: event?.description,
    });

    // Add canonical URL for this specific invitation
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
    metadata.alternates = {
      canonical: `${siteUrl}/invite/${token}`,
    };

    // Prevent indexing of individual invitations for privacy
    metadata.robots = {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    };

    return metadata;
  } catch (error) {
    console.error('Error generating invite metadata:', error);
    
    return {
      title: 'Event Invitation',
      description: 'You have been invited to an event',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * Layout for invitation pages with SEO and structured data
 */
export default async function InviteLayout({ children, params }: InviteLayoutProps) {
  const { token } = await params;

  // Fetch invitation data for structured data
  let structuredData = null;
  
  try {
    const response = await api.get<InviteData>(`/invites/${token}`);
    
    if (response.success && response.data) {
      const { event, template: templateData } = response.data;
      const template = templateData?.slug ? getTemplateBySlug(templateData.slug) : null;

      if (template && event) {
        // Generate JSON-LD structured data
        structuredData = generateTemplateStructuredData(template, {
          name: event.title,
          description: event.description,
          startDate: event.date,
          location: event.location || { name: event.venue },
          organizer: event.organizer,
        });
      }
    }
  } catch (error) {
    console.error('Error generating structured data:', error);
  }

  return (
    <>
      {/* Inject structured data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
      
      {/* Main content */}
      {children}
    </>
  );
}

