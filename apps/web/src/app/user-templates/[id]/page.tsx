import { notFound } from 'next/navigation';

interface UserTemplatePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * User-customized template route
 * Similar to base template but uses user's custom template configuration
 */
export default async function UserTemplatePage({ params, searchParams }: UserTemplatePageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  const eventData = resolvedSearchParams.event as string;
  const guestData = resolvedSearchParams.guest as string;
  const assetsData = resolvedSearchParams.assets as string;

  if (!eventData || !guestData) {
    notFound();
  }

  let event, guest, assets;
  try {
    event = JSON.parse(eventData);
    guest = JSON.parse(guestData);
    assets = assetsData ? JSON.parse(assetsData) : {};
  } catch (error) {
    console.error('Failed to parse template data:', error);
    notFound();
  }

  // For user templates, we might fetch the template config from the database
  // For now, we'll use the same dynamic import pattern
  try {
    const TemplateComponent = await import(`@/templates/user/${id}`);
    const Component = TemplateComponent.default || TemplateComponent;
    
    return <Component event={event} guest={guest} assets={assets} />;
  } catch (error) {
    console.error(`User template not found: ${id}`, error);
    notFound();
  }
}

