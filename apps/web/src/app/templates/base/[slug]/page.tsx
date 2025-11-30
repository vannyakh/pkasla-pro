import { notFound } from 'next/navigation';

interface TemplatePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Base template route - renders template with event and guest data
 * This route is used internally for rendering invitations
 * 
 * Query params:
 * - event: JSON stringified event data
 * - guest: JSON stringified guest data
 * - assets: JSON stringified assets data
 */
export default async function BaseTemplatePage({ params, searchParams }: TemplatePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Get data from query params (passed from invitation renderer)
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

  // Dynamically import the template component based on slug
  // Templates should be located in src/templates/base/[slug]/index.tsx
  try {
    const TemplateComponent = await import(`@/templates/base/${slug}`);
    const Component = TemplateComponent.default || TemplateComponent;
    
    return <Component event={event} guest={guest} assets={assets} />;
  } catch (error) {
    console.error(`Template not found: ${slug}`, error);
    notFound();
  }
}

