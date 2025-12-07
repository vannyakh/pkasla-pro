# Template SEO Implementation Guide

This guide explains how to implement SEO for templates using the metadata system.

## Overview

Each template now includes SEO metadata that integrates with Next.js App Router's metadata system. This provides:

- **Dynamic page titles** based on event and guest information
- **Rich descriptions** with event details
- **Open Graph tags** for social sharing
- **Structured data** for search engines
- **Customizable keywords** per template

## Template Metadata Structure

Each template's `metadata.ts` includes an `seo` field:

```typescript
export const metadata: TemplateMetadata = {
  // ... other fields
  seo: {
    title: 'Modern Minimal Wedding Invitation Template',
    description: 'Create stunning modern wedding invitations...',
    keywords: [
      'modern wedding invitation',
      'minimal wedding template',
      // ... more keywords
    ],
    ogImage: '/images/og-modern-minimal.png', // Optional custom OG image
    noIndex: false, // Set to true to prevent search indexing
    noFollow: false, // Set to true to prevent following links
  },
};
```

## Generating Metadata for Pages

### For Invitation Pages (`/invite/[token]`)

The invitation page automatically generates SEO metadata:

```typescript
import { generateMetadata } from './metadata';

export { generateMetadata };

export default async function InvitePage({ params }: { params: { token: string } }) {
  // ... page implementation
}
```

The metadata includes:
- **Guest name** in the title
- **Event name** and **date** in description
- **Template preview image** for social sharing

### For Template Preview Pages

```typescript
import type { Metadata } from 'next';
import { getTemplateBySlug, generateTemplateMetadata } from '@/templates/base';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const template = getTemplateBySlug(params.slug);
  
  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return generateTemplateMetadata(template);
}
```

## SEO Utility Functions

### 1. Generate Template Metadata

```typescript
import { generateTemplateMetadata } from '@/templates/base';

const metadata = generateTemplateMetadata(template, {
  guestName: 'John Doe',
  eventName: 'Wedding Celebration',
  eventDate: 'June 15, 2024',
  customTitle: 'Custom Title Override',
  customDescription: 'Custom description',
});
```

### 2. Generate Structured Data (JSON-LD)

```typescript
import { generateTemplateStructuredData } from '@/templates/base';

const structuredData = generateTemplateStructuredData(template, {
  name: 'Annual Conference 2024',
  description: 'Join us for the annual tech conference',
  startDate: '2024-06-15T09:00:00',
  endDate: '2024-06-15T18:00:00',
  location: {
    name: 'Convention Center',
    address: '123 Main St, City, State',
  },
  organizer: {
    name: 'Tech Corp',
  },
});

// Add to page:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
/>
```

### 3. Generate Social Sharing Tags

```typescript
import { generateTemplateSocialTags } from '@/templates/base';

const socialTags = generateTemplateSocialTags(template, {
  eventName: 'Summer Wedding',
  eventDate: 'June 15, 2024',
  customMessage: 'Join us for a beautiful celebration!',
});

// Use in share buttons
const shareUrl = `https://yoursite.com/invite/${token}`;
const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(socialTags.title)}&url=${encodeURIComponent(shareUrl)}&hashtags=${socialTags.hashtags.join(',')}`;
```

## Example Implementation

### Complete invitation page with SEO:

```typescript
// app/invite/[token]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/axios-client';
import { 
  getTemplateBySlug, 
  generateTemplateMetadata,
  generateTemplateStructuredData 
} from '@/templates/base';

interface InvitePageProps {
  params: { token: string };
}

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  try {
    const response = await api.get(`/invites/${params.token}`);
    
    if (!response.success) {
      return { title: 'Invitation Not Found' };
    }

    const { event, guest, template: templateData } = response.data;
    const template = getTemplateBySlug(templateData.slug);

    if (!template) {
      return { title: event?.title || 'Event Invitation' };
    }

    return generateTemplateMetadata(template, {
      guestName: guest?.name,
      eventName: event?.title,
      eventDate: new Date(event?.date).toLocaleDateString(),
    });
  } catch {
    return { title: 'Event Invitation' };
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const response = await api.get(`/invites/${params.token}`);
  
  if (!response.success) {
    notFound();
  }

  const { event, guest, template: templateData } = response.data;
  const template = getTemplateBySlug(templateData.slug);

  // Generate structured data
  const structuredData = template ? generateTemplateStructuredData(template, {
    name: event.title,
    startDate: event.date,
    location: { name: event.venue },
  }) : null;

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {/* Your template component */}
    </>
  );
}
```

## Best Practices

1. **Always provide fallbacks**: If event/guest data is unavailable, use template defaults
2. **Keep titles concise**: Under 60 characters for best display in search results
3. **Make descriptions compelling**: 150-160 characters, include key event details
4. **Use relevant keywords**: Include template category, style, and event type
5. **Test social sharing**: Verify OG images and descriptions on social platforms
6. **Include structured data**: Helps search engines understand your content

## Testing SEO

### Check metadata in development:
```bash
# View page source and check <head> tags
curl http://localhost:3000/invite/[token] | grep -A 20 "<head>"
```

### Test with tools:
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Google Rich Results Test](https://search.google.com/test/rich-results)

## Customization

To add custom SEO fields:

1. Update `TemplateSEO` type in `types.ts`
2. Add fields to template metadata files
3. Update `generateTemplateMetadata` to use new fields
4. Regenerate metadata for affected pages

## Performance Considerations

- Metadata generation is cached by Next.js
- Server-side generation ensures SEO data is available immediately
- No client-side JavaScript required for SEO tags

