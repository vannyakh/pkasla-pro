import type { Metadata } from 'next';
import { getTemplateBySlug, generateTemplateMetadata } from '@/templates/base';

interface TemplateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generate metadata for template preview/render pages
 */
export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;
    
    // Get template metadata
    const template = getTemplateBySlug(slug);

    if (!template) {
      return {
        title: 'Template Not Found',
        description: 'The template you are looking for could not be found.',
      };
    }

    // Parse event and guest data from query params if available
    let eventData = null;
    let guestData = null;

    try {
      if (resolvedSearchParams.event && typeof resolvedSearchParams.event === 'string') {
        eventData = JSON.parse(resolvedSearchParams.event);
      }
      if (resolvedSearchParams.guest && typeof resolvedSearchParams.guest === 'string') {
        guestData = JSON.parse(resolvedSearchParams.guest);
      }
    } catch (error) {
      console.error('Error parsing query params:', error);
    }

    // Format event date if available
    let eventDate = '';
    if (eventData?.date) {
      try {
        eventDate = new Date(eventData.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      } catch {
        eventDate = '';
      }
    }

    // Generate metadata with context if available
    return generateTemplateMetadata(template, {
      guestName: guestData?.name,
      eventName: eventData?.title,
      eventDate,
      customDescription: eventData?.description,
    });
  } catch (error) {
    console.error('Error generating template metadata:', error);
    
    return {
      title: 'Event Template',
      description: 'Beautiful event invitation template',
    };
  }
}

/**
 * Layout for template pages
 */
export default async function TemplateLayout({ children, params, searchParams }: TemplateLayoutProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Get template for potential structured data
  const template = getTemplateBySlug(slug);
  
  // Parse event data for structured data
  let eventData = null;
  try {
    if (resolvedSearchParams.event && typeof resolvedSearchParams.event === 'string') {
      eventData = JSON.parse(resolvedSearchParams.event);
    }
  } catch (error) {
    console.error('Error parsing event data:', error);
  }

  // Generate structured data if we have event data
  let structuredData = null;
  if (template && eventData) {
    try {
      const { generateTemplateStructuredData } = await import('@/templates/base');
      
      structuredData = generateTemplateStructuredData(template, {
        name: eventData.title,
        description: eventData.description,
        startDate: eventData.date,
        location: eventData.location || { name: eventData.venue },
        organizer: eventData.organizer,
      });
    } catch (error) {
      console.error('Error generating structured data:', error);
    }
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

