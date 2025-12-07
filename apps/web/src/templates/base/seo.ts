/**
 * SEO utilities for templates
 */

import type { Metadata } from 'next';
import { generateMetadata as generateSiteMetadata } from '@/lib/metadata';
import type { TemplateMetadata } from './types';

/**
 * Generate Next.js Metadata for a template
 */
export const generateTemplateMetadata = (
  template: TemplateMetadata,
  options?: {
    guestName?: string;
    eventName?: string;
    eventDate?: string;
    customTitle?: string;
    customDescription?: string;
  }
): Metadata => {
  const { guestName, eventName, eventDate, customTitle, customDescription } = options || {};

  // Build dynamic title
  let title = customTitle || template.seo?.title || template.name;
  if (eventName) {
    title = `${eventName} - ${title}`;
  }
  if (guestName) {
    title = `Invitation for ${guestName} - ${title}`;
  }

  // Build dynamic description
  let description = customDescription || template.seo?.description || template.description;
  if (eventName && eventDate) {
    description = `You're invited to ${eventName} on ${eventDate}. ${description}`;
  } else if (eventName) {
    description = `You're invited to ${eventName}. ${description}`;
  }

  // Build keywords from template tags and category
  const keywords = [
    ...(template.seo?.keywords || []),
    ...template.tags,
    template.category,
    'invitation',
    'event',
    'digital invitation',
  ];

  // Use template preview as OG image
  const image = template.seo?.ogImage || template.preview || template.thumbnail;

  return generateSiteMetadata({
    title,
    description,
    keywords,
    image,
    url: template.seo?.canonicalUrl,
    type: 'website',
    noIndex: template.seo?.noIndex,
    noFollow: template.seo?.noFollow,
  });
};

/**
 * Generate JSON-LD structured data for template events
 */
export const generateTemplateStructuredData = (
  template: TemplateMetadata,
  event?: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    location?: {
      name?: string;
      address?: string;
    };
    organizer?: {
      name?: string;
    };
  }
) => {
  if (!event) return null;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.name || 'Event',
    description: event.description || template.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(event.location && {
      location: {
        '@type': 'Place',
        name: event.location.name,
        address: event.location.address,
      },
    }),
    ...(event.organizer && {
      organizer: {
        '@type': 'Person',
        name: event.organizer.name,
      },
    }),
    image: [template.preview || template.thumbnail],
  };

  return structuredData;
};

/**
 * Generate meta tags for social sharing
 */
export const generateTemplateSocialTags = (
  template: TemplateMetadata,
  options?: {
    eventName?: string;
    eventDate?: string;
    customMessage?: string;
  }
) => {
  const { eventName, eventDate, customMessage } = options || {};

  let shareTitle = template.name;
  if (eventName) {
    shareTitle = `${eventName} Invitation`;
  }

  let shareDescription = customMessage || template.description;
  if (eventDate) {
    shareDescription = `Join us on ${eventDate}. ${shareDescription}`;
  }

  return {
    title: shareTitle,
    description: shareDescription,
    image: template.preview || template.thumbnail,
    hashtags: template.tags.slice(0, 3), // Top 3 tags as hashtags
  };
};

/**
 * Build canonical URL for template
 */
export const buildTemplateCanonicalUrl = (
  baseUrl: string,
  templateSlug: string,
  inviteToken?: string
): string => {
  if (inviteToken) {
    return `${baseUrl}/invite/${inviteToken}`;
  }
  return `${baseUrl}/templates/base/${templateSlug}`;
};

/**
 * Generate robots meta tag based on template settings
 */
export const generateTemplateRobotsMeta = (template: TemplateMetadata): string => {
  const directives: string[] = [];

  if (template.seo?.noIndex) {
    directives.push('noindex');
  } else {
    directives.push('index');
  }

  if (template.seo?.noFollow) {
    directives.push('nofollow');
  } else {
    directives.push('follow');
  }

  return directives.join(', ');
};

