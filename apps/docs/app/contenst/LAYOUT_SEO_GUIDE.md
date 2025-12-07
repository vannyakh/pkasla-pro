# Dynamic SEO Layout System for Templates

This guide explains how the layout system handles dynamic SEO metadata for each template.

## Overview

The layout system provides three specialized layouts that handle SEO metadata dynamically:

1. **Invitation Layout** (`/invite/[token]/layout.tsx`) - For public invitations
2. **Template Render Layout** (`/templates/base/[slug]/layout.tsx`) - For template rendering
3. **Preview Layout** (`/templates/preview/[id]/layout.tsx`) - For template previews

## Architecture

```
┌─────────────────────────────────────────────────────┐
│            User Request                              │
│         /invite/[token]                              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    Layout: Generate Metadata                        │
│    - Fetch invitation data                          │
│    - Get template metadata                          │
│    - Generate dynamic SEO tags                      │
│    - Create structured data                         │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    Page: Redirect to Template                       │
│    /templates/base/[slug]?event=...&guest=...       │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    Template Layout: Additional SEO                  │
│    - Parse event/guest from query params            │
│    - Enhance metadata                               │
│    - Add structured data                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│    Template Component: Render                       │
│    - Display invitation                             │
│    - Use template assets                            │
└─────────────────────────────────────────────────────┘
```

## 1. Invitation Layout

### Location
`/app/invite/[token]/layout.tsx`

### Purpose
Handles SEO for public invitation pages accessed via unique tokens.

### Features

- **Dynamic Metadata Generation**: Creates unique metadata for each invitation
- **Guest Personalization**: Includes guest name in page title
- **Event Context**: Adds event details to description
- **Privacy Control**: Sets `noindex` to prevent search indexing
- **Structured Data**: Generates JSON-LD for search engines
- **Social Sharing**: Optimized Open Graph tags

### Metadata Generation

```typescript
export async function generateMetadata({ params }) {
  const { token } = await params;
  
  // 1. Fetch invitation data
  const response = await api.get(`/invites/${token}`);
  const { event, guest, template } = response.data;
  
  // 2. Get template metadata
  const templateMeta = getTemplateBySlug(template.slug);
  
  // 3. Format event date
  const eventDate = new Date(event.date).toLocaleDateString(...);
  
  // 4. Generate comprehensive metadata
  return generateTemplateMetadata(templateMeta, {
    guestName: guest.name,
    eventName: event.title,
    eventDate,
  });
}
```

### SEO Output Example

```html
<head>
  <title>Invitation for John Doe - Summer Wedding - Modern Minimal Template</title>
  <meta name="description" content="You're invited to Summer Wedding on June 15, 2024. Create stunning modern wedding invitations..." />
  <meta name="robots" content="noindex, nofollow" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Invitation for John Doe - Summer Wedding" />
  <meta property="og:image" content="/images/assets/modern-minimal/modern-minimal.png" />
  
  <!-- Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "Summer Wedding",
    "startDate": "2024-06-15T14:00:00",
    "location": {
      "@type": "Place",
      "name": "Garden Venue"
    }
  }
  </script>
</head>
```

## 2. Template Render Layout

### Location
`/app/templates/base/[slug]/layout.tsx`

### Purpose
Handles SEO when templates are rendered directly (e.g., via redirects).

### Features

- **Query Param Parsing**: Extracts event/guest data from URL
- **Contextual Metadata**: Updates SEO based on available data
- **Flexible Handling**: Works with or without event data
- **Structured Data**: Generates event schema when data available

### Usage Flow

```typescript
// Redirected from invitation page
redirect(`/templates/base/${slug}?event=${JSON.stringify(event)}&guest=${JSON.stringify(guest)}`);

// Layout parses and uses data
const eventData = JSON.parse(searchParams.event);
const guestData = JSON.parse(searchParams.guest);

return generateTemplateMetadata(template, {
  guestName: guestData.name,
  eventName: eventData.title,
  eventDate: formatDate(eventData.date),
});
```

## 3. Preview Layout

### Location
`/app/templates/preview/[id]/layout.tsx`

### Purpose
Handles SEO for template preview pages in the dashboard.

### Features

- **Event-Based**: Fetches event data by ID
- **Preview Indicator**: Shows visual banner indicating preview mode
- **No Indexing**: Prevents search engines from indexing previews
- **Dashboard Context**: Optimized for authenticated users

### Preview Indicator

```tsx
<div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-black text-center py-2">
  Preview Mode - Event ID: {id}
</div>

<div className="pt-10">
  {children} {/* Content with top padding */}
</div>
```

## Dynamic Metadata Features

### 1. Personalized Titles

```typescript
// Without guest: "Summer Wedding - Modern Minimal Template"
// With guest: "Invitation for John Doe - Summer Wedding - Modern Minimal Template"

const title = guestName 
  ? `Invitation for ${guestName} - ${eventName} - ${template.name}`
  : `${eventName} - ${template.name}`;
```

### 2. Rich Descriptions

```typescript
// Base: Template description
// With event: "You're invited to {eventName} on {eventDate}. {template description}"

const description = eventName && eventDate
  ? `You're invited to ${eventName} on ${eventDate}. ${template.description}`
  : template.description;
```

### 3. Template-Specific Keywords

```typescript
const keywords = [
  ...template.seo.keywords,      // Template-specific keywords
  ...template.tags,               // Template tags
  template.category,              // Event category
  'invitation',                   // Generic keywords
  'event',
  'digital invitation',
];
```

### 4. Social Sharing Optimization

```typescript
openGraph: {
  title: `Invitation for ${guestName} - ${eventName}`,
  description: `Join us for ${eventName} on ${eventDate}`,
  image: template.preview || template.thumbnail,
  type: 'website',
}
```

## Privacy & SEO Settings

### Invitation Pages (Privacy First)

```typescript
robots: {
  index: false,      // Don't index individual invitations
  follow: false,     // Don't follow links
  googleBot: {
    index: false,
    follow: false,
  },
}
```

### Template Pages (Discoverable)

```typescript
robots: {
  index: true,       // Allow indexing of template pages
  follow: true,      // Follow links
}
```

### Preview Pages (Private)

```typescript
robots: {
  index: false,      // Never index preview pages
  follow: false,
}
```

## Structured Data (JSON-LD)

### Event Schema

```typescript
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Summer Wedding",
  "description": "Join us for a beautiful celebration",
  "startDate": "2024-06-15T14:00:00",
  "endDate": "2024-06-15T22:00:00",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Garden Venue",
    "address": "123 Main St, City, State"
  },
  "organizer": {
    "@type": "Person",
    "name": "John & Jane"
  },
  "image": ["/images/assets/modern-minimal/modern-minimal.png"]
}
```

## Testing & Validation

### Test Metadata Generation

```bash
# Development
curl http://localhost:3000/invite/[token] | grep -A 30 "<head>"

# Check specific meta tags
curl http://localhost:3000/invite/[token] | grep "og:title"
curl http://localhost:3000/invite/[token] | grep "application/ld+json"
```

### Validate Structured Data

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
4. **Twitter Card Validator**: https://cards-dev.twitter.com/validator

### Test Social Sharing

```bash
# Facebook
https://developers.facebook.com/tools/debug/?q=https://yoursite.com/invite/[token]

# Twitter
https://cards-dev.twitter.com/validator?url=https://yoursite.com/invite/[token]

# LinkedIn
https://www.linkedin.com/post-inspector/inspect/https://yoursite.com/invite/[token]
```

## Performance Considerations

### Server-Side Rendering

- All metadata generated server-side
- No client-side JavaScript required for SEO
- Fast initial page load
- Search engines see complete HTML

### Caching

```typescript
// Next.js automatically caches generateMetadata results
// Revalidate when needed:
export const revalidate = 3600; // Revalidate every hour
```

### Error Handling

```typescript
try {
  const response = await api.get(`/invites/${token}`);
  // ... generate metadata
} catch (error) {
  // Fallback to generic metadata
  return {
    title: 'Event Invitation',
    description: 'You have been invited to an event',
  };
}
```

## Best Practices

1. **Always provide fallbacks**: Graceful degradation when data is unavailable
2. **Keep titles under 60 characters**: For optimal display in search results
3. **Descriptions 150-160 characters**: Sweet spot for social sharing
4. **Use high-quality images**: Minimum 1200x630 for Open Graph
5. **Test on multiple platforms**: Each has different requirements
6. **Monitor performance**: Check page load times
7. **Update regularly**: Keep metadata fresh and relevant

## Troubleshooting

### Metadata Not Updating

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Or use dynamic rendering
export const dynamic = 'force-dynamic';
```

### Structured Data Errors

```typescript
// Validate dates are ISO 8601 format
const startDate = new Date(event.date).toISOString();

// Ensure all required fields present
if (!event.name || !event.startDate) {
  return null; // Don't generate invalid structured data
}
```

### Social Share Preview Not Working

1. Test URL with validators
2. Check image dimensions (min 1200x630)
3. Verify absolute URLs (not relative)
4. Clear social platform caches

## Migration Guide

### From Static Metadata

```typescript
// Before (static)
export const metadata = {
  title: 'My Event',
  description: 'Event description',
};

// After (dynamic)
export async function generateMetadata({ params }) {
  const data = await fetchData(params.id);
  return generateTemplateMetadata(template, {
    eventName: data.title,
  });
}
```

## Future Enhancements

- [ ] Add breadcrumb structured data
- [ ] Support multiple event performers
- [ ] Add FAQ schema for common questions
- [ ] Implement AMP support
- [ ] Add language alternates
- [ ] Support video embeds with VideoObject schema

