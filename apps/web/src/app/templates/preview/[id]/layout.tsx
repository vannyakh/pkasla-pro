import type { Metadata } from 'next';
import { api } from '@/lib/axios-client';
import { getTemplateBySlug, generateTemplateMetadata } from '@/templates/base';

interface PreviewLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

/**
 * Generate metadata for template preview pages
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    
    // Fetch event data for preview
    const response = await api.get<any>(`/events/${id}`);
    
    if (!response.success || !response.data) {
      return {
        title: 'Template Preview',
        description: 'Preview your event template',
      };
    }

    const event = response.data;
    
    // Get template metadata if template is selected
    const template = event.template?.slug ? getTemplateBySlug(event.template.slug) : null;

    if (!template) {
      return {
        title: `${event.title} - Template Preview`,
        description: event.description || 'Preview your event template',
      };
    }

    // Format event date
    let eventDate = '';
    if (event.date) {
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

    // Generate metadata for preview
    const metadata = generateTemplateMetadata(template, {
      eventName: event.title,
      eventDate,
      customTitle: `${event.title} - Preview`,
      customDescription: `Preview of ${event.title} using ${template.name} template`,
    });

    // Prevent indexing of preview pages
    metadata.robots = {
      index: false,
      follow: false,
    };

    return metadata;
  } catch (error) {
    console.error('Error generating preview metadata:', error);
    
    return {
      title: 'Template Preview',
      description: 'Preview your event template',
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

/**
 * Layout for template preview pages
 */
export default async function PreviewLayout({ children, params }: PreviewLayoutProps) {
  const { id } = await params;

  // Fetch event data for structured data
  let structuredData = null;
  
  try {
    const response = await api.get<any>(`/events/${id}`);
    
    if (response.success && response.data) {
      const event = response.data;
      const template = event.template?.slug ? getTemplateBySlug(event.template.slug) : null;

      if (template) {
        const { generateTemplateStructuredData } = await import('@/templates/base');
        
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
    console.error('Error generating preview structured data:', error);
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
      
      {/* Preview indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-2 text-sm font-medium">
        Preview Mode - Event ID: {id}
      </div>
      
      {/* Main content with top padding for preview indicator */}
      <div className="pt-10">
        {children}
      </div>
    </>
  );
}

