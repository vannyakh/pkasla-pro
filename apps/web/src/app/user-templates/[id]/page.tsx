import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

interface UserTemplatePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Map of available base templates that users can customize
// This mapping ensures Next.js can bundle these at build time
const BASE_TEMPLATE_MAP: Record<string, any> = {
  'modern-minimal': dynamic(() => import('@/templates/base/modern-minimal')),
  'elegant-rose': dynamic(() => import('@/templates/base/elegant-rose')),
  'tropical-paradise': dynamic(() => import('@/templates/base/tropical-paradise')),
  'vintage-lace': dynamic(() => import('@/templates/base/vintage-lace')),
  'classic-gold': dynamic(() => import('@/templates/base/classic-gold')),
  'corporate-professional': dynamic(() => import('@/templates/base/corporate-professional')),
  'birthday-celebration': dynamic(() => import('@/templates/base/birthday-celebration')),
  'anniversary-romance': dynamic(() => import('@/templates/base/anniversary-romance')),
};

/**
 * User-customized template route
 * Similar to base template but uses user's custom template configuration
 * 
 * User templates are based on base templates but with customized assets
 * The 'id' parameter should be the base template slug that the user customized
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

  // Get the template component from the static map
  // This allows Next.js to properly bundle the templates at build time
  const TemplateComponent = BASE_TEMPLATE_MAP[id];
  
  if (!TemplateComponent) {
    console.error(`User template not found: ${id}`);
    notFound();
  }

  // Render the base template with user's custom assets
  return <TemplateComponent event={event} guest={guest} assets={assets} />;
}

