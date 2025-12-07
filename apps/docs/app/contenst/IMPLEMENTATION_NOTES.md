# SEO Layout Implementation Notes

## ✅ Completed Implementation

### Files Created/Modified

1. **`/app/invite/[token]/layout.tsx`** ✅
   - Dynamic metadata generation for invitations
   - Structured data (JSON-LD) injection
   - Privacy-focused robots meta tags
   - Personalized SEO for each guest

2. **`/app/templates/base/[slug]/layout.tsx`** ✅
   - Template render metadata handling
   - Query parameter parsing for event/guest data
   - Contextual SEO enhancement
   - Structured data when event data available

3. **`/app/templates/preview/[id]/layout.tsx`** ✅
   - Preview mode metadata
   - Visual preview indicator
   - No-index settings for privacy
   - Event-based SEO generation

4. **Removed** ❌
   - `/app/invite/[token]/metadata.ts` (merged into layout.tsx)

### SEO Features Implemented

#### 1. Dynamic Title Generation
```
Pattern: "Invitation for {Guest} - {Event} on {Date} - {Template}"
Example: "Invitation for John Doe - Summer Wedding on June 15, 2024 - Modern Minimal Template"
```

#### 2. Contextual Descriptions
```
Pattern: "You're invited to {Event} on {Date}. {Template Description}"
Example: "You're invited to Summer Wedding on June 15, 2024. Create stunning modern wedding invitations with our clean and minimalist template."
```

#### 3. Keyword Optimization
- Template-specific keywords from metadata
- Event category and tags
- Generic invitation/event keywords
- Dynamic based on context

#### 4. Open Graph Tags
- Personalized titles
- Event-specific descriptions
- Template preview images
- Proper type attribution

#### 5. Structured Data (JSON-LD)
- Event schema with all details
- Location information
- Organizer data
- Start/end times
- Event status

#### 6. Privacy Controls
- `noindex` for invitation pages
- `nofollow` for private content
- `index` for public template pages
- Canonical URLs

## Route Structure

```
/invite/[token]
  ├── layout.tsx          → SEO + Structured Data
  ├── page.tsx           → Redirects to template
  ├── not-found.tsx      → 404 handling
  └── rsvp/
      └── page.tsx       → RSVP functionality

/templates/base/[slug]
  ├── layout.tsx         → Template SEO
  └── page.tsx          → Renders template

/templates/preview/[id]
  ├── layout.tsx         → Preview SEO + Indicator
  └── page.tsx          → Preview render
```

## Metadata Flow

### Invitation Request Flow

```
1. User visits: /invite/abc123
   ↓
2. Layout.generateMetadata()
   - Fetches invitation data
   - Gets template metadata
   - Generates SEO tags
   - Creates structured data
   ↓
3. HTML <head> populated with:
   - <title>Personalized Title</title>
   - <meta name="description" content="...">
   - <meta property="og:*" content="...">
   - <script type="application/ld+json">...</script>
   ↓
4. Page.tsx executes
   - Redirects to /templates/base/[slug]?event=...&guest=...
   ↓
5. Template Layout.generateMetadata()
   - Parses query params
   - Enhances metadata
   - Adds additional structured data
   ↓
6. Template renders with complete SEO
```

## Integration Points

### With Template Metadata System

```typescript
import { 
  getTemplateBySlug,           // Get template config
  generateTemplateMetadata,     // Generate Next.js Metadata
  generateTemplateStructuredData // Generate JSON-LD
} from '@/templates/base';
```

### With Site Metadata System

```typescript
import { generateMetadata } from '@/lib/metadata';

// Template system enhances base site metadata
const metadata = generateTemplateMetadata(template, options);
// Returns full Metadata object with all SEO tags
```

## Privacy & Indexing Strategy

| Page Type | Index | Follow | Reason |
|-----------|-------|--------|--------|
| `/invite/[token]` | ❌ No | ❌ No | Private invitations |
| `/templates/base/[slug]` | ✅ Yes | ✅ Yes | Public templates |
| `/templates/preview/[id]` | ❌ No | ❌ No | Authenticated previews |

## Structured Data Examples

### Wedding Event

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Summer Garden Wedding",
  "description": "Join us for a beautiful celebration",
  "startDate": "2024-06-15T14:00:00-07:00",
  "endDate": "2024-06-15T22:00:00-07:00",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "Rose Garden Venue",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Garden Lane",
      "addressLocality": "San Francisco",
      "addressRegion": "CA",
      "postalCode": "94102"
    }
  },
  "image": [
    "https://example.com/images/assets/modern-minimal/modern-minimal.png"
  ],
  "organizer": {
    "@type": "Person",
    "name": "John & Jane Doe"
  }
}
```

### Corporate Event

```json
{
  "@context": "https://schema.org",
  "@type": "BusinessEvent",
  "name": "Annual Tech Conference 2024",
  "startDate": "2024-09-20T09:00:00",
  "location": {
    "@type": "Place",
    "name": "Convention Center"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Tech Corp Inc."
  }
}
```

## Testing Checklist

- [x] Metadata generates correctly for invitations
- [x] Structured data validates on schema.org
- [x] Guest names appear in titles
- [x] Event dates formatted properly
- [x] Template images load for OG tags
- [x] Privacy settings (noindex) applied
- [x] Preview indicator shows correctly
- [x] Fallbacks work when data missing
- [x] No TypeScript errors
- [x] No linter warnings

## Performance Metrics

- **Server-side rendering**: All metadata generated on server
- **No client JS for SEO**: Complete HTML in initial response
- **Cache strategy**: Automatic Next.js caching
- **Bundle size**: No additional client-side code

## Error Handling

All layouts include comprehensive error handling:

```typescript
try {
  const data = await fetchData();
  return generateMetadata(data);
} catch (error) {
  console.error('Error:', error);
  return fallbackMetadata; // Always provide fallback
}
```

## Future Enhancements

### Potential Additions

1. **Language Support**
   ```typescript
   alternates: {
     languages: {
       'en-US': '/invite/token',
       'km-KH': '/invite/token?lang=km'
     }
   }
   ```

2. **AMP Support**
   ```typescript
   alternates: {
     types: {
       'application/amp+html': '/invite/token/amp'
     }
   }
   ```

3. **Multiple Images**
   ```typescript
   images: [
     { url: template.preview, width: 1200, height: 630 },
     { url: template.thumbnail, width: 800, height: 600 }
   ]
   ```

4. **Video Support**
   ```typescript
   videos: [{
     url: event.videoUrl,
     width: 1920,
     height: 1080
   }]
   ```

## Deployment Notes

### Environment Variables Required

```env
NEXT_PUBLIC_SITE_URL=https://yoursite.com
NEXT_PUBLIC_SITE_NAME=Phkasla
NEXT_PUBLIC_API_URL=https://api.yoursite.com
```

### Build Verification

```bash
# Build and check for errors
npm run build

# Verify metadata generation
npm run build && npm run start
curl http://localhost:3000/invite/test-token | grep -A 20 "<head>"
```

### Production Checklist

- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Canonical URLs correct
- [ ] Images accessible
- [ ] API endpoints responsive
- [ ] Error pages tested
- [ ] Social sharing tested
- [ ] Structured data validated

## Support & Maintenance

### Monitoring

- Track metadata generation errors in logs
- Monitor API response times
- Check structured data validation weekly
- Test social sharing monthly

### Updates

- Keep template metadata current
- Update structured data schemas as needed
- Review SEO performance quarterly
- Update keywords based on analytics

## Related Documentation

- [Template Metadata System](/templates/base/types.ts)
- [SEO Utilities](/templates/base/seo.ts)
- [Site Metadata](/lib/metadata.ts)
- [Layout SEO Guide](./LAYOUT_SEO_GUIDE.md)

