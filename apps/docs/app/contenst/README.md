# Guest Management Module

This module handles event guest management with support for Google Sheets synchronization.

## Features

### Core Guest Management
- ✅ Create, read, update, delete guests
- ✅ Bulk import from CSV
- ✅ Guest status tracking (pending/confirmed/declined)
- ✅ Gift tracking
- ✅ Invitation tokens and QR codes
- ✅ Guest tags (bride/groom/etc)
- ✅ Search and filtering
- ✅ Pagination support

### Google Sheets Integration
- ✅ Sync guests to Google Sheets
- ✅ Auto-create spreadsheets
- ✅ Real-time data sync
- ✅ Dual storage (DB + Sheets)
- ✅ Formatted spreadsheets with headers

## Quick Start

### 1. Basic Guest Operations

```typescript
import { guestService } from './guest.service';

// Create a guest
const guest = await guestService.create({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  eventId: 'event123',
  status: 'pending',
});

// Get guests for an event
const guests = await guestService.findByEventId('event123');

// Update a guest
await guestService.updateById('guest123', {
  status: 'confirmed',
  hasGivenGift: true,
});

// Delete a guest
await guestService.deleteById('guest123');
```

### 2. Google Sheets Sync

See [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md) for detailed setup instructions.

```bash
# Quick sync to Google Sheets
curl -X POST \
  http://localhost:4000/api/guests/event/EVENT_ID/sync-to-sheets \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"autoCreate": true}'
```

## API Endpoints

### Guest Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guests` | List all guests (paginated) |
| GET | `/api/guests/:id` | Get guest by ID |
| GET | `/api/guests/event/:eventId` | Get guests for an event |
| GET | `/api/guests/my` | Get current user's guests |
| POST | `/api/guests` | Create a new guest |
| POST | `/api/guests/bulk` | Import guests from CSV |
| POST | `/api/guests/:id/regenerate-token` | Regenerate invite token |
| POST | `/api/guests/qr/:token/join` | Join event via QR code |
| PATCH | `/api/guests/:id` | Update a guest |
| DELETE | `/api/guests/:id` | Delete a guest |

### Google Sheets Sync

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guests/event/:eventId/sheets-config` | Check sync configuration |
| POST | `/api/guests/event/:eventId/sync-to-sheets` | Sync guests to Google Sheets |

### Gift Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guests/gifts/event/:eventId` | Get gifts for an event |
| POST | `/api/guests/gifts` | Record a gift |
| PATCH | `/api/guests/gifts/:id` | Update a gift |
| DELETE | `/api/guests/gifts/:id` | Delete a gift |

## File Structure

```
guests/
├── guest.model.ts              # Guest data model
├── guest.service.ts            # Guest business logic
├── guest.controller.ts         # API request handlers
├── guest.router.ts             # API route definitions
├── guest.validation.ts         # Request validation schemas
├── guest.repository.ts         # Database operations
├── gift.model.ts               # Gift data model
├── gift.service.ts             # Gift business logic
├── gift.controller.ts          # Gift API handlers
├── gift.router.ts              # Gift API routes
├── gift.validation.ts          # Gift validation schemas
├── gift.repository.ts          # Gift database operations
├── google-sheets.service.ts    # Google Sheets integration
├── google-sheets.example.ts    # Usage examples
├── README.md                   # This file
├── GOOGLE_SHEETS_SETUP.md      # Quick setup guide
├── GOOGLE_SHEETS_INTEGRATION.md # Detailed integration docs
└── IMPLEMENTATION_SUMMARY.md   # Implementation details
```

## Documentation

- **[README.md](./README.md)** - This file, overview of the module
- **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)** - 5-minute setup guide
- **[GOOGLE_SHEETS_INTEGRATION.md](./GOOGLE_SHEETS_INTEGRATION.md)** - Comprehensive integration guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details
- **[google-sheets.example.ts](./google-sheets.example.ts)** - Code examples

## Environment Variables

```env
# Google Sheets Integration (Optional)
GOOGLE_SHEETS_ENABLED=true
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Data Models

### Guest
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  eventId: string;
  status: 'pending' | 'confirmed' | 'declined';
  occupation?: string;
  address?: string;
  province?: string;
  tag?: string;
  hasGivenGift: boolean;
  notes?: string;
  inviteToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Gift
```typescript
{
  id: string;
  guestId: string;
  eventId: string;
  amount?: number;
  currency?: string;
  type: 'cash' | 'check' | 'other';
  notes?: string;
  receivedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Security

- ✅ Authentication required for all write operations
- ✅ Event ownership verification
- ✅ Input validation on all requests
- ✅ Rate limiting on sensitive endpoints
- ✅ Secure credential storage
- ✅ Access control via Google Sheets permissions

## Testing

```bash
# Run tests (when available)
npm test

# Test Google Sheets integration
curl -X GET \
  http://localhost:4000/api/guests/event/EVENT_ID/sheets-config \
  -H 'Authorization: Bearer TOKEN'
```

## Support

For issues or questions:
1. Check the documentation files
2. Review error messages in logs
3. Verify environment configuration
4. Check Google Cloud Console for API status

## License

Part of the Event Management System

