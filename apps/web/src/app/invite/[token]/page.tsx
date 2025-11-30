import { notFound, redirect } from 'next/navigation';
import { api } from '@/lib/axios-client';

interface InvitePageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ preview?: string }>;
}

/**
 * Public invitation page
 * Fetches guest and event data by token and renders the selected template
 */
export default async function InvitePage({ params, searchParams }: InvitePageProps) {
  const { token } = await params;
  const resolvedSearchParams = await searchParams;
  const isPreview = resolvedSearchParams.preview === 'true';

  try {
    // Fetch invitation data from backend
    const response = await api.get(`/invites/${token}`);
    
    if (!response.success || !response.data) {
      notFound();
    }

    const { event, guest, template, assets } = response.data;

    if (!event || !guest) {
      notFound();
    }

    // If no template is selected, show a default message
    if (!template || !template.slug) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>
            <p className="text-gray-600">No template selected for this event.</p>
          </div>
        </div>
      );
    }

    // Build query params for template route
    // Include token in guest data for RSVP links
    const guestWithToken = { ...guest, inviteToken: token };
    const templateParams = new URLSearchParams({
      event: JSON.stringify(event),
      guest: JSON.stringify(guestWithToken),
      assets: JSON.stringify(assets),
    });

    // Redirect to the appropriate template route
    if (template.slug) {
      redirect(`/templates/base/${template.slug}?${templateParams.toString()}`);
    }

    notFound();
  } catch (error) {
    console.error('Failed to load invitation:', error);
    notFound();
  }
}

